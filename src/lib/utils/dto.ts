import type { Note, SyncManifest } from '../types/note.js';

/**
 * Serialize a Note to the DTO JSON format that matches Swift's JSONEncoder with .sortedKeys.
 * Optional fields (isEncrypted, isPinned when false; nullable fields when null) are omitted.
 */
export function noteToDtoJson(note: Note): string {
  const dto: Record<string, unknown> = {
    content: note.content,
    createdAt: note.createdAt,
  };

  if (note.deletedAt) dto.deletedAt = note.deletedAt;
  if (note.encryptedContent) dto.encryptedContent = note.encryptedContent;

  dto.id = note.id;

  if (note.isEncrypted) dto.isEncrypted = true;
  if (note.isPinned) dto.isPinned = true;
  if (note.iv) dto.iv = note.iv;
  if (note.salt) dto.salt = note.salt;

  dto.title = note.title;
  dto.updatedAt = note.updatedAt;
  dto.version = note.version;

  // JSON.stringify with sorted keys replacer
  const sorted = Object.keys(dto).sort();
  return JSON.stringify(dto, sorted);
}

export function jsonToNote(json: string): Note {
  const raw = JSON.parse(json);
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt ?? null,
    version: raw.version,
    isEncrypted: raw.isEncrypted ?? false,
    encryptedContent: raw.encryptedContent ?? null,
    salt: raw.salt ?? null,
    iv: raw.iv ?? null,
    isPinned: raw.isPinned ?? false,
  };
}

export function manifestToJson(manifest: SyncManifest): string {
  return JSON.stringify(manifest, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(value).sort()) {
        sorted[k] = value[k];
      }
      return sorted;
    }
    return value;
  });
}

export function jsonToManifest(json: string): SyncManifest {
  const raw = JSON.parse(json);
  return {
    noteHashes: raw.noteHashes ?? {},
    deletedNoteIds: raw.deletedNoteIds ?? [],
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}
