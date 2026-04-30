export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  isEncrypted: boolean;
  encryptedContent: string | null;
  salt: string | null;
  iv: string | null;
  isPinned: boolean;
}

export interface NoteIndex {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  isPinned: boolean;
  isEncrypted: boolean;
  version: number;
}

export interface SyncManifest {
  noteHashes: Record<string, string>;
  deletedNoteIds: string[];
  updatedAt: string;
}

export interface RemoteNoteFile {
  remoteId: string;
  noteId: string;
  updatedAt: string;
}

export function createNote(title: string): Note {
  const now = isoNow();
  return {
    id: crypto.randomUUID(),
    title,
    content: '',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    isEncrypted: false,
    encryptedContent: null,
    salt: null,
    iv: null,
    isPinned: false,
  };
}

export function noteToIndex(note: Note): NoteIndex {
  return {
    id: note.id,
    title: note.title,
    updatedAt: note.updatedAt,
    createdAt: note.createdAt,
    deletedAt: note.deletedAt,
    isPinned: note.isPinned,
    isEncrypted: note.isEncrypted,
    version: note.version,
  };
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function emptyManifest(): SyncManifest {
  return {
    noteHashes: {},
    deletedNoteIds: [],
    updatedAt: new Date().toISOString(),
  };
}
