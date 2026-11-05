/**
 * Turns a password into a proof for the server, using a deliberately slow hash in the browser.
 * The Workers Free plan has too little CPU per request to run this on the server. See worker/security.ts.
 */
const ITERATIONS = 600_000;

export async function passwordProof(email: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(`cantera:v1:${email.trim().toLowerCase()}`), iterations: ITERATIONS },
    key,
    256,
  );
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
