import type { DropboxTokens } from '../types/sync.js';

const APP_KEY = 'sisv9mjbb6xqw4e';
const AUTH_URL = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';

const STORAGE_KEY = 'noting_dropbox_tokens';
const VERIFIER_KEY = 'noting_oauth_verifier';

function getRedirectUri(): string {
  return `${location.origin}${import.meta.env.BASE_URL}`;
}

function readTokens(): DropboxTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeTokens(tokens: DropboxTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function generateCodeVerifier(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(64));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export class DropboxAuth {
  get isConnected(): boolean {
    return readTokens()?.refreshToken != null;
  }

  async authorize(): Promise<void> {
    const verifier = generateCodeVerifier();
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      client_id: APP_KEY,
      response_type: 'code',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      token_access_type: 'offline',
      redirect_uri: getRedirectUri(),
    });

    window.location.href = `${AUTH_URL}?${params}`;
  }

  async handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    if (!verifier) throw new Error('Missing OAuth verifier');

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      code_verifier: verifier,
      client_id: APP_KEY,
      redirect_uri: getRedirectUri(),
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
    const data = await res.json();
    this.persistTokens(data);
  }

  async getValidAccessToken(): Promise<string> {
    const tokens = readTokens();
    if (!tokens?.refreshToken) throw new Error('Not connected to Dropbox');

    if (tokens.accessToken && Date.now() < tokens.expiresAt) {
      return tokens.accessToken;
    }

    return this.refreshAccessToken(tokens.refreshToken);
  }

  /** Invalidate cached access token so next getValidAccessToken forces a refresh. */
  invalidateAccessToken(): void {
    const tokens = readTokens();
    if (tokens) {
      tokens.accessToken = '';
      tokens.expiresAt = 0;
      writeTokens(tokens);
    }
  }

  disconnect(): void {
    clearTokens();
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: APP_KEY,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) throw new Error(`Token refresh failed (${res.status})`);
    const data = await res.json();

    const tokens = readTokens()!;
    tokens.accessToken = data.access_token;
    tokens.expiresAt = Date.now() + (data.expires_in - 300) * 1000;
    writeTokens(tokens);

    return data.access_token;
  }

  private persistTokens(data: Record<string, unknown>): void {
    const tokens: DropboxTokens = {
      accessToken: data.access_token as string,
      refreshToken: (data.refresh_token as string) ?? readTokens()?.refreshToken ?? '',
      expiresAt: Date.now() + ((data.expires_in as number) - 300) * 1000,
    };
    writeTokens(tokens);
  }
}
