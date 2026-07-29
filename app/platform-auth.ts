const encoder = new TextEncoder();

export const PLATFORM_SESSION_COOKIE = "awakening_platform_session";
export const PLATFORM_SESSION_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.PLATFORM_AUTH_SECRET ?? "";
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function fromHex(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) {
    return new Uint8Array();
  }
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (pair) =>
    Number.parseInt(pair, 16),
  );
}

async function getSigningKey() {
  const secret = getSecret();
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createPlatformSession(username: string) {
  const key = await getSigningKey();
  if (!key) throw new Error("Platform authentication is not configured.");

  const expiresAt = Date.now() + PLATFORM_SESSION_SECONDS * 1000;
  const payload = `${encodeURIComponent(username)}.${expiresAt}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return `${payload}.${toHex(signature)}`;
}

export async function verifyPlatformSession(token?: string) {
  if (!token) return false;
  const [username, rawExpiry, signature] = token.split(".");
  const expiresAt = Number(rawExpiry);
  if (!username || !signature || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const key = await getSigningKey();
  if (!key) return false;
  const payload = `${username}.${rawExpiry}`;
  return crypto.subtle.verify(
    "HMAC",
    key,
    fromHex(signature),
    encoder.encode(payload),
  );
}
