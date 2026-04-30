export type SyncStatus = 'idle' | 'pendingSync' | 'syncing' | 'synced' | 'error';

export interface DropboxTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
