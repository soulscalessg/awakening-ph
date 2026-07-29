type SupabaseRequestOptions = RequestInit & {
  prefer?: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return { url, secretKey };
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
  requestHeaders.set("apikey", config.secretKey);
  requestHeaders.set("authorization", `Bearer ${config.secretKey}`);
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
