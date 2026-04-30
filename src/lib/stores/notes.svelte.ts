import type { Note, NoteIndex } from '../types/note.js';
import { createNote, noteToIndex, isoNow } from '../types/note.js';
import type { OPFSStorage } from '../services/storage.js';
import { encrypt, encryptWithKey, decrypt, decryptWithKey } from '../services/crypto.js';
import type { EncryptedPayload } from '../services/crypto.js';
import { debounce } from '../utils/debounce.js';
import { t } from '../i18n/index.svelte.js';

export class NotesStore {
  index = $state<NoteIndex[]>([]);
  selectedNoteId = $state<string | null>(null);
  searchQuery = $state('');
  loadedNote = $state<Note | null>(null);
  decryptedContent = $state<string | null>(null);
  private derivedKey = $state<CryptoKey | null>(null);
  private storage: OPFSStorage | null = null;
  private onNoteChanged: (() => void) | null = null;

  private debouncedSave = debounce(async (content: string) => {
    await this.persistContent(content);
  }, 300);

  get activeNotes(): NoteIndex[] {
    return this.index.filter((n) => n.deletedAt == null);
  }

  get sortedNotes(): NoteIndex[] {
    return [...this.activeNotes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }

  get filteredNotes(): NoteIndex[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.sortedNotes;
    return this.sortedNotes.filter((n) => n.title.toLowerCase().includes(q));
  }

  get selectedIndex(): NoteIndex | null {
    if (!this.selectedNoteId) return null;
    return this.index.find((n) => n.id === this.selectedNoteId) ?? null;
  }

  async init(storage: OPFSStorage, onNoteChanged?: () => void): Promise<void> {
    this.storage = storage;
    this.onNoteChanged = onNoteChanged ?? null;
    this.index = await storage.readIndex();
  }

  async reloadIndex(): Promise<void> {
    if (!this.storage) return;
    this.index = await this.storage.readIndex();
  }

  async selectNote(id: string | null): Promise<void> {
    this.flushPendingSave();
    this.decryptedContent = null;
    this.derivedKey = null;
    this.selectedNoteId = id;
    if (id && this.storage) {
      this.loadedNote = await this.storage.readNote(id);
    } else {
      this.loadedNote = null;
    }
  }

  async createNewNote(): Promise<string> {
    if (!this.storage) throw new Error('Storage not initialized');
    const note = createNote(t('newNote'));
    this.index = await this.storage.writeNote(note);
    await this.selectNote(note.id);
    return note.id;
  }

  saveContent(content: string): void {
    this.debouncedSave(content);
  }

  flushPendingSave(): void {
    this.debouncedSave.flush();
  }

  private async persistContent(content: string): Promise<void> {
    if (!this.loadedNote || !this.storage) return;

    const note = this.loadedNote;
    const now = isoNow();

    if (note.isEncrypted && this.derivedKey) {
      const payload = await encryptWithKey(content, this.derivedKey, note.salt!);
      note.encryptedContent = payload.encryptedContent;
      note.iv = payload.iv;
      note.content = '';
    } else {
      note.content = content;
    }

    note.updatedAt = now;
    note.version += 1;
    this.index = await this.storage.writeNote(note);
    this.onNoteChanged?.();
  }

  async renameNote(title: string): Promise<void> {
    if (!this.loadedNote || !this.storage) return;
    this.loadedNote.title = title;
    this.loadedNote.updatedAt = isoNow();
    this.loadedNote.version += 1;
    this.index = await this.storage.writeNote(this.loadedNote);
    this.onNoteChanged?.();
  }

  async togglePin(): Promise<void> {
    if (!this.loadedNote || !this.storage) return;
    this.loadedNote.isPinned = !this.loadedNote.isPinned;
    this.loadedNote.updatedAt = isoNow();
    this.loadedNote.version += 1;
    this.index = await this.storage.writeNote(this.loadedNote);
    this.onNoteChanged?.();
  }

  async deleteNote(): Promise<void> {
    if (!this.loadedNote || !this.storage) return;
    this.loadedNote.deletedAt = isoNow();
    this.loadedNote.updatedAt = isoNow();
    this.loadedNote.version += 1;
    this.index = await this.storage.writeNote(this.loadedNote);
    await this.selectNote(null);
    this.onNoteChanged?.();
  }

  // --- Encryption ---

  async unlockNote(password: string): Promise<boolean> {
    if (!this.loadedNote?.encryptedContent || !this.loadedNote.salt) return false;
    try {
      const { text, key } = await decrypt(
        this.loadedNote.encryptedContent,
        password,
        this.loadedNote.salt,
      );
      this.decryptedContent = text;
      this.derivedKey = key;
      return true;
    } catch {
      return false;
    }
  }

  async setPassword(password: string): Promise<void> {
    if (!this.loadedNote || !this.storage) return;
    const content = this.loadedNote.isEncrypted ? (this.decryptedContent ?? '') : this.loadedNote.content;
    const payload = await encrypt(content, password);
    this.loadedNote.isEncrypted = true;
    this.loadedNote.encryptedContent = payload.encryptedContent;
    this.loadedNote.salt = payload.salt;
    this.loadedNote.iv = payload.iv;
    this.loadedNote.content = '';
    this.loadedNote.updatedAt = isoNow();
    this.loadedNote.version += 1;
    this.index = await this.storage.writeNote(this.loadedNote);

    // Re-derive key for subsequent saves
    const { key } = await decrypt(payload.encryptedContent, password, payload.salt);
    this.derivedKey = key;
    this.decryptedContent = content;
    this.onNoteChanged?.();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.loadedNote?.encryptedContent || !this.loadedNote.salt) return false;
    try {
      const { text } = await decrypt(
        this.loadedNote.encryptedContent,
        currentPassword,
        this.loadedNote.salt,
      );
      const payload = await encrypt(text, newPassword);
      this.loadedNote.encryptedContent = payload.encryptedContent;
      this.loadedNote.salt = payload.salt;
      this.loadedNote.iv = payload.iv;
      this.loadedNote.updatedAt = isoNow();
      this.loadedNote.version += 1;
      this.index = await this.storage!.writeNote(this.loadedNote);

      const { key } = await decrypt(payload.encryptedContent, newPassword, payload.salt);
      this.derivedKey = key;
      this.decryptedContent = text;
      this.onNoteChanged?.();
      return true;
    } catch {
      return false;
    }
  }

  async removePassword(): Promise<void> {
    if (!this.loadedNote || !this.storage) return;
    const content = this.decryptedContent ?? '';
    this.loadedNote.isEncrypted = false;
    this.loadedNote.content = content;
    this.loadedNote.encryptedContent = null;
    this.loadedNote.salt = null;
    this.loadedNote.iv = null;
    this.loadedNote.updatedAt = isoNow();
    this.loadedNote.version += 1;
    this.decryptedContent = null;
    this.derivedKey = null;
    this.index = await this.storage.writeNote(this.loadedNote);
    this.onNoteChanged?.();
  }
}
