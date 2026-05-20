/**
 * JWT Authentication using Web Crypto API
 * Token valid for 4 hours in sessionStorage
 */

const TOKEN_KEY = "admin_token";
const TOKEN_EXPIRY_HOURS = 4;

/**
 * Issue a JWT token signed with HMAC-SHA256
 * @param {string} password - The admin password
 * @returns {Promise<string>} - The JWT token
 */
export async function issueToken(password) {
  const secret = new TextEncoder().encode(password);
  const algorithm = { name: "HMAC", hash: "SHA-256" };

  // Import the secret as a key
  const key = await crypto.subtle.importKey("raw", secret, algorithm, false, [
    "sign",
  ]);

  // Create header and payload
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + TOKEN_EXPIRY_HOURS * 3600,
    type: "admin",
  };

  // Encode to base64url
  const headerEncoded = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const payloadEncoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const message = `${headerEncoded}.${payloadEncoded}`;
  const messageEncoded = new TextEncoder().encode(message);

  // Sign the message
  const signatureBuffer = await crypto.subtle.sign(
    algorithm,
    key,
    messageEncoded,
  );
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureEncoded = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const token = `${message}.${signatureEncoded}`;

  // Store in sessionStorage
  sessionStorage.setItem(TOKEN_KEY, token);

  return token;
}

/**
 * Get the stored token from sessionStorage
 * @returns {string|null} - The stored token or null
 */
export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Verify if a token is still valid (not expired)
 * @param {string} token - The JWT token
 * @returns {boolean} - Whether the token is valid
 */
export function verifyToken(token) {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode payload (add padding if needed)
    const payloadEncoded = parts[1];
    const padding = 4 - (payloadEncoded.length % 4);
    const payloadPadded =
      payloadEncoded + (padding < 4 ? "=".repeat(padding) : "");

    const payloadStr = atob(
      payloadPadded.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const payload = JSON.parse(payloadStr);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

/**
 * Clear the stored token (logout)
 */
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
