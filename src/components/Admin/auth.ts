const TOKEN_STORAGE_KEY = "admin_token";
const TOKEN_TTL_SECONDS = 4 * 60 * 60;

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = import.meta.env.VITE_ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("VITE_ADMIN_PASSWORD is not configured");
  }

  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage,
  );
}

function parseToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  return parts as [string, string, string];
}

export async function issueToken(password: string): Promise<string | null> {
  const secret = getSecret();

  if (password !== secret) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "admin",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const encodedHeader = toBase64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await getKey(secret, ["sign"]);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput)),
  );
  const token = `${signingInput}.${toBase64Url(signature)}`;

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

  return token;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getSecret();
    const [encodedHeader, encodedPayload, encodedSignature] = parseToken(token);
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload)),
    ) as { exp?: number };

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return false;
    }

    const key = await getKey(secret, ["verify"]);
    const signature = fromBase64Url(encodedSignature);
    const signatureBuffer = signature.buffer.slice(
      signature.byteOffset,
      signature.byteOffset + signature.byteLength,
    ) as ArrayBuffer;
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(`${encodedHeader}.${encodedPayload}`),
    );

    return verified;
  } catch {
    return false;
  }
}

export async function getStoredToken(): Promise<string | null> {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return null;
  }

  if (!(await verifyToken(token))) {
    clearToken();
    return null;
  }

  return token;
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}
