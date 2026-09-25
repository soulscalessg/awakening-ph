type SupabaseRequestOptions = RequestInit & {
  prefer?: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return { url, secretKey };
}

function applySupabaseAuthHeaders(headers: Headers, secretKey: string) {
  headers.set("apikey", secretKey);
  // The new sb_secret_* keys are opaque API keys, not JWTs. Legacy
  // service_role keys still require the bearer header for compatibility.
  if (!secretKey.startsWith("sb_")) {
    headers.set("authorization", `Bearer ${secretKey}`);
  }
}

function storagePath(bucket: string, objectPath: string) {
  return `${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

function storageHeaders(contentType?: string) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Awakening Server is not configured.");
  const headers = new Headers();
  applySupabaseAuthHeaders(headers, config.secretKey);
  if (contentType) headers.set("content-type", contentType);
  return { config, headers };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

export async function supabaseRequest<T>(
  path: string,
  { prefer, headers, ...init }: SupabaseRequestOptions = {},
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const requestHeaders = new Headers(headers);
  applySupabaseAuthHeaders(requestHeaders, config.secretKey);
  requestHeaders.set("content-type", "application/json");
  if (prefer) requestHeaders.set("prefer", prefer);

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function uploadPrivateObject(
  bucket: string,
  objectPath: string,
  bytes: Uint8Array,
  contentType: string,
) {
  const { config, headers } = storageHeaders(contentType);
  headers.set("x-upsert", "false");
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const response = await fetch(`${config.url}/storage/v1/object/${storagePath(bucket, objectPath)}`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Awakening file upload failed (${response.status}).`);
}

export async function deletePrivateObject(bucket: string, objectPath: string) {
  const { config, headers } = storageHeaders("application/json");
  const response = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes: [objectPath] }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Awakening file cleanup failed (${response.status}).`);
}

export async function createPrivateObjectSignedUrl(
  bucket: string,
  objectPath: string,
  expiresIn = 300,
) {
  const { config, headers } = storageHeaders("application/json");
  const response = await fetch(`${config.url}/storage/v1/object/sign/${storagePath(bucket, objectPath)}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ expiresIn }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Awakening file preview failed (${response.status}).`);
  const result = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = result.signedURL ?? result.signedUrl;
  if (!signedPath) throw new Error("Awakening file preview was not acknowledged.");
  if (signedPath.startsWith("http")) return signedPath;
  if (signedPath.startsWith("/storage/v1/")) return `${config.url}${signedPath}`;
  const normalized = signedPath.startsWith("/") ? signedPath : `/${signedPath}`;
  return `${config.url}/storage/v1${normalized}`;
}
