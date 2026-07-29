import { isSupabaseConfigured, supabaseRequest } from "../../supabase-server";

export const dynamic = "force-dynamic";

type ScheduleRecord = {
  id: string;
  event_at: string;
  venue: string;
  city?: string | null;
  capacity?: number | null;
  status: string;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Schedule storage is not configured." }, { status: 503 });
  }

  try {
    const records = await supabaseRequest<ScheduleRecord[]>(
      "awakening_schedules?select=id,event_at,venue,city,capacity,status&status=eq.scheduled&order=event_at.asc",
    );
    const now = Date.now();
    const upcoming = records.filter((record) => new Date(record.event_at).getTime() >= now);
    return Response.json({ data: upcoming.length ? upcoming : records });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load schedules." },
      { status: 502 },
    );
  }
}
