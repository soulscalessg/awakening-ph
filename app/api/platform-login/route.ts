import {
  createPlatformSession,
  PLATFORM_SESSION_COOKIE,
  PLATFORM_SESSION_SECONDS,
} from "../../platform-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expectedUsername = process.env.PLATFORM_ADMIN_USERNAME;
  const expectedPassword = process.env.PLATFORM_ADMIN_PASSWORD;
  const authSecret = process.env.PLATFORM_AUTH_SECRET;

  if (!expectedUsername || !expectedPassword || !authSecret) {
    return Response.json(
      { error: "Platform login is not configured." },
      { status: 503 },
    );
  }

  let credentials: { username?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    credentials.username !== expectedUsername ||
    credentials.password !== expectedPassword
  ) {
    return Response.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }

  const token = await createPlatformSession(expectedUsername);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${PLATFORM_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PLATFORM_SESSION_SECONDS}${secure}`,
  );

  return Response.json({ ok: true }, { headers });
}
