const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 600000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

let cachedKey: CryptoKey | null = null;

function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await getKeyMaterial(password);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function unlockStorage(password: string): Promise<boolean> {
  try {
    const stored = localStorage.getItem('mh-vault');
    if (!stored) {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      cachedKey = await deriveKey(password, salt);
      localStorage.setItem('mh-vault-salt', btoa(String.fromCharCode(...salt)));
      return true;
    }
    const salt = Uint8Array.from(atob(localStorage.getItem('mh-vault-salt') || ''), c => c.charCodeAt(0));
    cachedKey = await deriveKey(password, salt);
    const testData = localStorage.getItem('mh-vault');
    if (testData) {
      await decrypt(testData);
    }
    return true;
  } catch {
    cachedKey = null;
    return false;
  }
}

export function lockStorage(): void {
  cachedKey = null;
}

export function isUnlocked(): boolean {
  return cachedKey !== null;
}

export function isVaultCreated(): boolean {
  return !!localStorage.getItem('mh-vault-salt');
}

async function encrypt(plaintext: string): Promise<string> {
  if (!cachedKey) throw new Error('Storage locked');
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
    cachedKey,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(ciphertext: string): Promise<string> {
  if (!cachedKey) throw new Error('Storage locked');
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv: iv.buffer as ArrayBuffer }, cachedKey, data);
  return new TextDecoder().decode(decrypted);
}

export async function setItem(key: string, value: unknown): Promise<void> {
  const payload = JSON.stringify(value);
  const encrypted = await encrypt(payload);
  localStorage.setItem(key, encrypted);
}

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const decrypted = await decrypt(stored);
    return JSON.parse(decrypted) as T;
  } catch {
    return fallback;
  }
}

export async function removeItem(key: string): Promise<void> {
  localStorage.removeItem(key);
}
