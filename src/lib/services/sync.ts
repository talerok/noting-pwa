import type { Note, NoteIndex, SyncManifest } from '../types/note.js';
import { emptyManifest, noteToIndex } from '../types/note.js';
import { noteToDtoJson, jsonToManifest, manifestToJson } from '../utils/dto.js';
import { sha256hex } from '../utils/hash.js';
import type { OPFSStorage } from './storage.js';
import type { DropboxAPI } from './dropbox-api.js';

const PURGE_DAYS = 30;

export async function performSync(
  storage: OPFSStorage,
  api: DropboxAPI,
  activeNoteId: string | null,
): Promise<void> {
  // 1. Download remote manifest
  const { json: manifestJson, rev } = await api.downloadManifest();
  const remoteManifest = manifestJson ? jsonToManifest(manifestJson) : emptyManifest();
  let currentRev = rev;

  // 2. Build local hashes
  const localNotes = await storage.readAllNotes();
  const localMap = new Map<string, Note>(localNotes.map((n) => [n.id, n]));
  const localHashes = new Map<string, string>();
  for (const note of localNotes) {
    const json = noteToDtoJson(note);
    localHashes.set(note.id, await sha256hex(json));
  }

  // 3. List remote files
  const remoteFiles = await api.listRemoteNotes();
  const remoteFileMap = new Map(remoteFiles.map((f) => [f.noteId, f]));

  // 4. Determine changes
  const allNoteIds = new Set([...localHashes.keys(), ...Object.keys(remoteManifest.noteHashes)]);
  const toUpload: string[] = [];
  const toDownload: string[] = [];
  const toDeleteRemote: string[] = [];
  const toDeleteLocal: string[] = [];
  const updatedHashes = { ...remoteManifest.noteHashes };
  const deletedIds = new Set(remoteManifest.deletedNoteIds);
  let failedCount = 0;

  for (const noteId of allNoteIds) {
    const localHash = localHashes.get(noteId);
    const remoteHash = remoteManifest.noteHashes[noteId];
    const localNote = localMap.get(noteId);

    if (localHash != null && remoteHash == null) {
      // Local only
      if (deletedIds.has(noteId)) {
        toDeleteLocal.push(noteId);
        continue;
      }
      if (localNote?.deletedAt != null) continue;
      toUpload.push(noteId);
    } else if (localHash == null && remoteHash != null) {
      // Remote only
      if (deletedIds.has(noteId)) continue;
      if (noteId === activeNoteId) continue;
      toDownload.push(noteId);
    } else if (localHash != null && remoteHash != null && localHash !== remoteHash) {
      // Both exist, hashes differ — conflict
      if (localNote?.deletedAt != null) {
        toDeleteRemote.push(noteId);
        continue;
      }

      const remoteFile = remoteFileMap.get(noteId);
      if (!remoteFile) {
        toUpload.push(noteId);
        continue;
      }

      try {
        const remoteNote = await api.downloadNote(remoteFile.remoteId);
        if (localNote && localWins(localNote, remoteNote)) {
          toUpload.push(noteId);
        } else {
          // Remote wins — save locally
          await storage.writeNote(remoteNote);
          const savedJson = noteToDtoJson(remoteNote);
          updatedHashes[noteId] = await sha256hex(savedJson);
        }
      } catch (err) {
        console.error(`Conflict download failed for ${noteId}:`, err);
        failedCount++;
      }
    }
  }

  // 5. Execute uploads
  for (const noteId of toUpload) {
    const note = localMap.get(noteId);
    if (!note) continue;
    try {
      await api.uploadNote(note);
      updatedHashes[noteId] = await sha256hex(noteToDtoJson(note));
    } catch (err) {
      console.error(`Upload failed for ${noteId}:`, err);
      failedCount++;
    }
  }

  // 6. Execute downloads
  for (const noteId of toDownload) {
    const remoteFile = remoteFileMap.get(noteId);
    if (!remoteFile) continue;
    try {
      const note = await api.downloadNote(remoteFile.remoteId);
      await storage.writeNote(note);
    } catch (err) {
      console.error(`Download failed for ${noteId}:`, err);
      failedCount++;
    }
  }

  // 7. Remote deletes
  for (const noteId of toDeleteRemote) {
    try {
      const remoteFile = remoteFileMap.get(noteId);
      if (remoteFile) {
        await api.deleteRemoteNote(remoteFile.remoteId);
      }
      delete updatedHashes[noteId];
      deletedIds.add(noteId);
    } catch (err) {
      console.error(`Remote delete failed for ${noteId}:`, err);
      failedCount++;
    }
  }

  // 8. Local deletes
  for (const noteId of toDeleteLocal) {
    await storage.deleteNoteFile(noteId);
    await storage.removeFromIndex(noteId);
    delete updatedHashes[noteId];
  }

  // 9. Purge notes soft-deleted >30 days ago
  const cutoff = Date.now() - PURGE_DAYS * 24 * 3600 * 1000;
  for (const note of localNotes) {
    if (!note.deletedAt) continue;
    if (new Date(note.deletedAt).getTime() >= cutoff) continue;

    const remoteFile = remoteFileMap.get(note.id);
    if (remoteFile) {
      try {
        await api.deleteRemoteNote(remoteFile.remoteId);
      } catch (err) {
        console.error(`Purge remote note ${note.id} failed:`, err);
      }
    }
    delete updatedHashes[note.id];
    deletedIds.delete(note.id);
    await storage.deleteNoteFile(note.id);
    await storage.removeFromIndex(note.id);
  }

  // 10. Upload manifest
  const finalManifest: SyncManifest = {
    noteHashes: updatedHashes,
    deletedNoteIds: Array.from(deletedIds),
    updatedAt: new Date().toISOString(),
  };
  try {
    currentRev = await api.uploadManifest(manifestToJson(finalManifest), currentRev);
  } catch (err) {
    console.error('Manifest upload failed:', err);
    failedCount++;
  }

  // Save manifest locally
  await storage.writeManifest(finalManifest);

  console.log(
    `Sync done — uploaded: ${toUpload.length}, downloaded: ${toDownload.length}, remoteDeletes: ${toDeleteRemote.length}, localDeletes: ${toDeleteLocal.length}, failed: ${failedCount}`,
  );

  if (failedCount > 0) {
    throw new Error(`Sync completed with ${failedCount} failed note(s)`);
  }
}

function localWins(local: Note | NoteIndex, remote: Note): boolean {
  if (local.version !== remote.version) {
    return local.version > remote.version;
  }
  return local.updatedAt > remote.updatedAt;
}
