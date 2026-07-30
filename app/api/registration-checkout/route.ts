import { takeRateLimit } from "../../rate-limit";
import { isSupabaseConfigured, supabaseRequest } from "../../supabase-server";

export const dynamic = "force-dynamic";

function text(value: unknown, maxLength: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = text(payload.name, 160);
    const email = text(payload.email, 254).toLowerCase();
    const phone = text(payload.phone, 40);
    const scheduleId = text(payload.schedule_id, 80);
    if (!name || !email || !phone || !scheduleId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Complete your name, email, contact number, and schedule first." }, { status: 400 });
    }

    const rate = await takeRateLimit(request, "registration-checkout", 6, 600, email);
    if (!rate.allowed) {
      return Response.json(
        { error: "Too many payment attempts. Please wait a few minutes, then try again." },
        { status: 429, headers: { "retry-after": String(rate.retry_after_seconds) } },
      );
    }

    const schedules = await supabaseRequest<{ id: string }[]>(
      `awakening_schedules?select=id&id=eq.${encodeURIComponent(scheduleId)}&status=eq.scheduled&limit=1`,
    );
    if (!schedules[0]) {
      return Response.json({ error: "That schedule is no longer available. Choose another date." }, { status: 409 });
    }

    return Response.json({ ok: true, remaining: rate.remaining });
  } catch {
    return Response.json({ error: "Payment could not be opened right now. Please try again." }, { status: 502 });
  }
}
