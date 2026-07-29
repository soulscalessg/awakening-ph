import { PLATFORM_SESSION_COOKIE, verifyPlatformSession } from "../../../platform-auth";
import { isSupabaseConfigured, supabaseRequest } from "../../../supabase-server";

export const dynamic = "force-dynamic";

const resources = {
  contacts: "awakening_contacts",
  documents: "awakening_documents",
  galleries: "awakening_galleries",
  leads: "awakening_leads",
  registrations: "awakening_registrations",
  schedules: "awakening_schedules",
  "organization-applications": "awakening_organization_applications",
  "staffing-applications": "awakening_staffing_applications",
  "sponsorship-applications": "awakening_sponsorship_applications",
} as const;

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  for (const item of cookies.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

async function authorize(request: Request) {
  return verifyPlatformSession(cookieValue(request, PLATFORM_SESSION_COOKIE));
}

async function resolveTable(context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  return resources[resource as keyof typeof resources] ?? null;
}

function unavailable() {
  return Response.json(
    { error: "Supabase is not configured for this deployment." },
    { status: 503 },
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const table = await resolveTable(context);
  if (!table) return Response.json({ error: "Unknown resource." }, { status: 404 });
  if (!isSupabaseConfigured()) return unavailable();

  try {
    const data = await supabaseRequest<Record<string, unknown>[]>(
      `${table}?select=*&order=created_at.desc`,
    );
    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load data." },
      { status: 502 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const table = await resolveTable(context);
  if (!table) return Response.json({ error: "Unknown resource." }, { status: 404 });
  if (!isSupabaseConfigured()) return unavailable();

  try {
    const payload = await request.json();
    const data = await supabaseRequest<Record<string, unknown>[]>(table, {
      method: "POST",
      body: JSON.stringify(payload),
      prefer: "return=representation",
    });
    return Response.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create record." },
      { status: 502 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const table = await resolveTable(context);
  if (!table) return Response.json({ error: "Unknown resource." }, { status: 404 });
  if (!isSupabaseConfigured()) return unavailable();

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Record id is required." }, { status: 400 });

  try {
    const payload = await request.json();
    const data = await supabaseRequest<Record<string, unknown>[]>(
      `${table}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        prefer: "return=representation",
      },
    );
    return Response.json({ data: data[0] });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update record." },
      { status: 502 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const table = await resolveTable(context);
  if (!table) return Response.json({ error: "Unknown resource." }, { status: 404 });
  if (!isSupabaseConfigured()) return unavailable();

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Record id is required." }, { status: 400 });

  try {
    await supabaseRequest<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete record." },
      { status: 502 },
    );
  }
}
