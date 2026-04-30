import type { SyncStatus } from '../types/sync.js';
import { DropboxAuth } from '../services/dropbox-auth.js';
import { DropboxAPI } from '../services/dropbox-api.js';
import { performSync } from '../services/sync.js';
import type { OPFSStorage } from '../services/storage.js';

export class SyncStore {
  status = $state<SyncStatus>('idle');
  errorMessage = $state('');
  lastSyncTime = $state<Date | null>(null);
  afterSync: (() => void) | null = null;

  readonly auth = new DropboxAuth();
  private api = new DropboxAPI(this.auth);
  private syncing = false;
  private pendingSync = false;
  private scheduledTimer: ReturnType<typeof setTimeout> | null = null;

  get isConnected(): boolean {
    return this.auth.isConnected;
  }

  async sync(storage: OPFSStorage, activeNoteId: string | null): Promise<void> {
    if (!this.isConnected) return;

    if (this.syncing) {
      this.pendingSync = true;
      return;
    }

    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
    }

    this.syncing = true;
    this.status = 'syncing';

    try {
      await performSync(storage, this.api, activeNoteId);
      this.status = 'synced';
      this.errorMessage = '';
      this.lastSyncTime = new Date();
      this.afterSync?.();
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.syncing = false;
    }

    if (this.pendingSync) {
      this.pendingSync = false;
      await this.sync(storage, activeNoteId);
    }
  }

  scheduleSync(storage: OPFSStorage, activeNoteId: string | null, delayMs = 3000): void {
    if (!this.isConnected) return;

    if (this.scheduledTimer) clearTimeout(this.scheduledTimer);

    if (!this.syncing) {
      this.status = 'pendingSync';
    }

    this.scheduledTimer = setTimeout(() => {
      this.scheduledTimer = null;
      this.sync(storage, activeNoteId);
    }, delayMs);
  }

  async connect(): Promise<void> {
    await this.auth.authorize();
  }

  disconnect(): void {
    this.auth.disconnect();
    this.status = 'idle';
    this.errorMessage = '';
    this.lastSyncTime = null;
  }

  async handleOAuthCallback(code: string): Promise<void> {
    await this.auth.handleCallback(code);
  }
}
