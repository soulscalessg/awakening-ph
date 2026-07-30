import { authorizePlatformRequest } from "../../../platform-auth";
import { deletePrivateObject, isSupabaseConfigured, supabaseRequest } from "../../../supabase-server";

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

async function resolveTable(context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  return resources[resource as keyof typeof resources] ?? null;
}

function unavailable() {
  return Response.json(
    { error: "Awakening Server is not configured for this deployment." },
    { status: 503 },
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await authorizePlatformRequest(request))) {
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
  if (!(await authorizePlatformRequest(request))) {
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
  if (!(await authorizePlatformRequest(request))) {
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
  if (!(await authorizePlatformRequest(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const table = await resolveTable(context);
  if (!table) return Response.json({ error: "Unknown resource." }, { status: 404 });
  if (!isSupabaseConfigured()) return unavailable();

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Record id is required." }, { status: 400 });

  try {
    let paymentProofPath = "";
    if (table === "awakening_registrations") {
      const records = await supabaseRequest<{ payment_proof_path?: string }[]>(
        `${table}?select=payment_proof_path&id=eq.${encodeURIComponent(id)}&limit=1`,
      );
      paymentProofPath = String(records[0]?.payment_proof_path ?? "");
    }
    await supabaseRequest<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
    if (paymentProofPath) {
      await deletePrivateObject("payment-proofs", paymentProofPath).catch(() => undefined);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete record." },
      { status: 502 },
    );
  }
}
