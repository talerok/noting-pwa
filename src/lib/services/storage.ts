import type { Note, NoteIndex, SyncManifest } from '../types/note.js';
import type { Settings } from '../types/settings.js';
import { defaultSettings } from '../types/settings.js';

export class OPFSStorage {
  private root: FileSystemDirectoryHandle | null = null;
  private notesDir: FileSystemDirectoryHandle | null = null;

  async init(): Promise<void> {
    this.root = await navigator.storage.getDirectory();
    this.notesDir = await this.root.getDirectoryHandle('notes', { create: true });
    // Request persistent storage to prevent eviction
    await navigator.storage.persist?.();
  }

  // --- Notes ---

  async readNote(id: string): Promise<Note | null> {
    if (!this.notesDir) return null;
    try {
      const handle = await this.notesDir.getFileHandle(`${id}.json`);
      const file = await handle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async writeNote(note: Note): Promise<NoteIndex[]> {
    if (!this.notesDir || !this.root) return [];
    // Write individual note file
    const handle = await this.notesDir.getFileHandle(`${note.id}.json`, { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(note));
    await writable.close();
    // Update index and return the new index
    return this.updateIndex(note);
  }

  async deleteNoteFile(id: string): Promise<void> {
    if (!this.notesDir) return;
    try {
      await this.notesDir.removeEntry(`${id}.json`);
    } catch {
      // Already deleted
    }
  }

  // --- Index ---

  async readIndex(): Promise<NoteIndex[]> {
    if (!this.root) return [];
    try {
      const handle = await this.root.getFileHandle('index.json');
      const file = await handle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  async writeIndex(index: NoteIndex[]): Promise<void> {
    if (!this.root) return;
    const handle = await this.root.getFileHandle('index.json', { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(index));
    await writable.close();
  }

  private async updateIndex(note: Note): Promise<NoteIndex[]> {
    const index = await this.readIndex();
    const entry: NoteIndex = {
      id: note.id,
      title: note.title,
      updatedAt: note.updatedAt,
      createdAt: note.createdAt,
      deletedAt: note.deletedAt,
      isPinned: note.isPinned,
      isEncrypted: note.isEncrypted,
      version: note.version,
    };
    const existing = index.findIndex((n) => n.id === note.id);
    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.push(entry);
    }
    await this.writeIndex(index);
    return index;
  }

  async removeFromIndex(id: string): Promise<void> {
    const index = await this.readIndex();
    const filtered = index.filter((n) => n.id !== id);
    await this.writeIndex(filtered);
  }

  // --- All Notes (for sync) ---

  async readAllNotes(): Promise<Note[]> {
    if (!this.notesDir) return [];
    const notes: Note[] = [];
    for await (const [name, handle] of this.notesDir as any) {
      if (!name.endsWith('.json') || !(handle as FileSystemFileHandle).getFile) continue;
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        notes.push(JSON.parse(text));
      } catch {
        // Skip corrupt files
      }
    }
    return notes;
  }

  // --- Manifest ---

  async readManifest(): Promise<SyncManifest | null> {
    if (!this.root) return null;
    try {
      const handle = await this.root.getFileHandle('manifest.json');
      const file = await handle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async writeManifest(manifest: SyncManifest): Promise<void> {
    if (!this.root) return;
    const handle = await this.root.getFileHandle('manifest.json', { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(manifest));
    await writable.close();
  }

  // --- Settings ---

  async readSettings(): Promise<Settings> {
    if (!this.root) return defaultSettings;
    try {
      const handle = await this.root.getFileHandle('settings.json');
      const file = await handle.getFile();
      const text = await file.text();
      return { ...defaultSettings, ...JSON.parse(text) };
    } catch {
      return defaultSettings;
    }
  }

  async writeSettings(settings: Settings): Promise<void> {
    if (!this.root) return;
    const handle = await this.root.getFileHandle('settings.json', { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(settings));
    await writable.close();
  }
}
