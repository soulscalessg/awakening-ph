import { PLATFORM_SESSION_COOKIE } from "../../platform-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${PLATFORM_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
  return Response.json({ ok: true }, { headers });
}
