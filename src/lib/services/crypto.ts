/**
 * CryptoService — AES-GCM encryption with PBKDF2 key derivation.
 * Compatible with Swift CryptoKit format:
 * encryptedContent = base64(nonce[12] + ciphertext + tag[16])
 */

const ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedPayload {
  encryptedContent: string; // base64
  salt: string; // base64
  iv: string; // base64
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBytes = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    256,
  );
  return crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encrypt(plaintext: string, password: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(password, salt);
  return encryptWithKey(plaintext, key, toBase64(salt));
}

export async function encryptWithKey(
  plaintext: string,
  key: CryptoKey,
  saltBase64: string,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const ciphertextWithTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes,
  );

  // CryptoKit combined format: nonce(12) + ciphertext + tag(16)
  const combined = new Uint8Array(IV_LENGTH + ciphertextWithTag.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextWithTag), IV_LENGTH);

  return {
    encryptedContent: toBase64(combined),
    salt: saltBase64,
    iv: toBase64(iv),
  };
}

export async function decrypt(
  encryptedBase64: string,
  password: string,
  saltBase64: string,
): Promise<{ text: string; key: CryptoKey }> {
  const salt = fromBase64(saltBase64);
  const key = await deriveKey(password, salt);
  const text = await decryptWithKey(encryptedBase64, key);
  return { text, key };
}

export async function decryptWithKey(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const combined = fromBase64(encryptedBase64);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertextWithTag = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertextWithTag);
  return new TextDecoder().decode(decrypted);
}
