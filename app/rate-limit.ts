import { supabaseRequest } from "./supabase-server";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
};

function clientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function takeRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
  identity = "",
) {
  const secret = process.env.PLATFORM_AUTH_SECRET ?? "awakening-public";
  const clientKey = await sha256(`${secret}|${clientAddress(request)}|${identity.toLowerCase()}`);
  const rows = await supabaseRequest<RateLimitResult[]>("rpc/awakening_take_rate_limit", {
    method: "POST",
    body: JSON.stringify({
      p_scope: scope,
      p_client_key: clientKey,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }),
  });
  return rows[0] ?? { allowed: false, remaining: 0, retry_after_seconds: windowSeconds };
}
