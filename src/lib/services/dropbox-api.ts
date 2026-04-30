import type { Note, RemoteNoteFile } from '../types/note.js';
import { noteToDtoJson, jsonToNote } from '../utils/dto.js';
import type { DropboxAuth } from './dropbox-auth.js';

const CONTENT_URL = 'https://content.dropboxapi.com/2/files';
const API_URL = 'https://api.dropboxapi.com/2/files';
const BASE_PATH = '/Noting/notes';
const MANIFEST_PATH = '/Noting/manifest.json';
const MAX_RETRIES = 4;

export class DropboxAPI {
  constructor(private auth: DropboxAuth) {}

  async listRemoteNotes(): Promise<RemoteNoteFile[]> {
    await this.ensureFolder();

    const res = await this.post(`${API_URL}/list_folder`, {
      json: { path: BASE_PATH, recursive: false },
    });

    if (res.status === 409) return [];
    if (!res.ok) throw new Error(`list_folder failed (${res.status})`);

    let data = await res.json();
    let entries: any[] = data.entries ?? [];

    while (data.has_more) {
      const cont = await this.post(`${API_URL}/list_folder/continue`, {
        json: { cursor: data.cursor },
      });
      if (!cont.ok) break;
      data = await cont.json();
      entries.push(...(data.entries ?? []));
    }

    return entries
      .filter((e: any) => e.name?.endsWith('.json'))
      .map((e: any) => ({
        remoteId: e.id,
        noteId: e.name.slice(0, -5),
        updatedAt: e.server_modified ?? new Date().toISOString(),
      }));
  }

  async downloadNote(remoteId: string): Promise<Note> {
    const apiArg = JSON.stringify({ path: remoteId });
    const res = await this.post(`${CONTENT_URL}/download`, {
      headers: { 'Dropbox-API-Arg': apiArg },
    });
    if (!res.ok) throw new Error(`download note failed (${res.status})`);
    const text = await res.text();
    return jsonToNote(text);
  }

  async uploadNote(note: Note): Promise<void> {
    const path = `${BASE_PATH}/${note.id}.json`;
    const apiArg = JSON.stringify({ path, mode: 'overwrite', autorename: false });
    const body = noteToDtoJson(note);

    const res = await this.post(`${CONTENT_URL}/upload`, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': apiArg,
      },
      body,
    });
    if (!res.ok) throw new Error(`upload note failed (${res.status})`);
  }

  async deleteRemoteNote(remoteId: string): Promise<void> {
    const res = await this.post(`${API_URL}/delete_v2`, {
      json: { path: remoteId },
    });
    // 409 = already deleted
    if (res.status !== 409 && !res.ok) {
      throw new Error(`delete note failed (${res.status})`);
    }
  }

  async downloadManifest(): Promise<{ json: string | null; rev: string | null }> {
    const apiArg = JSON.stringify({ path: MANIFEST_PATH });
    const res = await this.post(`${CONTENT_URL}/download`, {
      headers: { 'Dropbox-API-Arg': apiArg },
    });

    if (res.status === 409) return { json: null, rev: null };
    if (!res.ok) throw new Error(`download manifest failed (${res.status})`);

    let rev: string | null = null;
    const apiResult = res.headers.get('dropbox-api-result');
    if (apiResult) {
      try {
        const meta = JSON.parse(apiResult);
        rev = meta.rev ?? null;
      } catch {
        // ignore
      }
    }

    const json = await res.text();
    return { json, rev };
  }

  async uploadManifest(json: string, rev: string | null): Promise<string> {
    const mode = rev ? { '.tag': 'update', update: rev } : 'overwrite';
    const apiArg = JSON.stringify({ path: MANIFEST_PATH, mode, autorename: false });

    const res = await this.post(`${CONTENT_URL}/upload`, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': apiArg,
      },
      body: json,
    });
    if (!res.ok) throw new Error(`upload manifest failed (${res.status})`);

    const data = await res.json();
    if (!data.rev) throw new Error('Missing rev in manifest upload response');
    return data.rev;
  }

  // --- Internal ---

  private async ensureFolder(): Promise<void> {
    try {
      await this.post(`${API_URL}/create_folder_v2`, {
        json: { path: BASE_PATH, autorename: false },
      });
    } catch {
      // Folder may already exist
    }
  }

  private async post(
    url: string,
    opts: { json?: unknown; headers?: Record<string, string>; body?: string } = {},
  ): Promise<Response> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        let token = await this.auth.getValidAccessToken();
        let res = await this.doPost(url, token, opts);

        if (res.status === 401) {
          this.auth.invalidateAccessToken();
          token = await this.auth.getValidAccessToken();
          res = await this.doPost(url, token, opts);
        }

        return res;
      } catch (err) {
        if (attempt === MAX_RETRIES - 1) throw err;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async doPost(
    url: string,
    token: string,
    opts: { json?: unknown; headers?: Record<string, string>; body?: string },
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    };

    let body: string | undefined;
    if (opts.json) {
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.json);
    } else if (opts.body) {
      body = opts.body;
    }

    return fetch(url, { method: 'POST', headers, body });
  }
}
