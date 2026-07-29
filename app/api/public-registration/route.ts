import { isSupabaseConfigured, supabaseRequest } from "../../supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Registration storage is not configured." },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const required = ["name", "email", "phone", "event_date"];
    if (required.some((field) => !String(payload[field] ?? "").trim())) {
      return Response.json({ error: "Required registration details are missing." }, { status: 400 });
    }

    const data = await supabaseRequest<Record<string, unknown>[]>(
      "awakening_registrations",
      {
        method: "POST",
        body: JSON.stringify({
          name: String(payload.name),
          email: String(payload.email),
          phone: String(payload.phone),
          event_date: String(payload.event_date),
          quantity: Math.max(1, Number(payload.quantity) || 1),
          total_amount: Math.max(0, Number(payload.total_amount) || 0),
          payment_method: String(payload.payment_method ?? ""),
          payment_reference: String(payload.payment_reference ?? ""),
          payment_proof_name: String(payload.payment_proof_name ?? ""),
          status: "for_confirmation",
        }),
        prefer: "return=representation",
      },
    );
    return Response.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save registration." },
      { status: 502 },
    );
  }
}
