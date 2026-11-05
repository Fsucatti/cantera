/**
 * Passwords and sessions.
 *
 * The Workers Free plan allows about 10 ms of CPU per request, too little for a slow password hash.
 * So the browser runs PBKDF2 (see src/lib/password.ts) and sends the result, and the Worker
 * stores a salted SHA-256 of it. Guessing a stored password still costs one full PBKDF2 per try.
 */
const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return [...view].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export function randomHex(byteCount: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(byteCount)));
}

export function isPasswordProof(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

export const hashProof = (salt: string, proof: string) => sha256Hex(`${salt}:${proof}`);

/** Compares without stopping at the first difference, so timing reveals nothing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

export const SESSION_COOKIE = "cantera_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;
