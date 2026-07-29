import { isSupabaseConfigured, supabaseRequest } from "../../supabase-server";

export const dynamic = "force-dynamic";

const TICKET_PRICE = 1499;

function text(value: unknown, maxLength: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

async function findExistingRegistration(email: string, paymentReference: string) {
  if (!email || !paymentReference) return null;
  const records = await supabaseRequest<Record<string, unknown>[]>(
    `awakening_registrations?select=*&email=eq.${encodeURIComponent(email)}&payment_reference=eq.${encodeURIComponent(paymentReference)}&limit=1`,
  );
  return records[0] ?? null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Registration storage is not configured." },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = text(payload.name, 160);
    const email = text(payload.email, 254).toLowerCase();
    const phone = text(payload.phone, 40);
    const eventDate = text(payload.event_date, 300);
    const paymentMethod = text(payload.payment_method, 20).toLowerCase();
    const paymentReference = text(payload.payment_reference, 120);
    const paymentProofName = text(payload.payment_proof_name, 220);
    const paymentProofData = String(payload.payment_proof_data ?? "");
    const quantity = Math.min(20, Math.max(1, Math.trunc(Number(payload.quantity) || 1)));

    if (!name || !email || !phone || !eventDate || !paymentReference || !paymentProofName || !paymentProofData) {
      return Response.json({ error: "Required registration details are missing." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!new Set(["gcash", "bank"]).has(paymentMethod)) {
      return Response.json({ error: "Choose GCash or bank transfer." }, { status: 400 });
    }
    if (!paymentProofData.startsWith("data:image/") || paymentProofData.length > 4_100_000) {
      return Response.json({ error: "Upload a valid payment proof image smaller than 3 MB." }, { status: 400 });
    }

    const existing = await findExistingRegistration(email, paymentReference);
    if (existing) {
      return Response.json({ data: existing, duplicate: true }, { status: 200 });
    }

    const record = {
      name,
      email,
      phone,
      event_date: eventDate,
      quantity,
      total_amount: TICKET_PRICE * quantity,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      payment_proof_name: JSON.stringify({ name: paymentProofName, data: paymentProofData }),
      status: "for_confirmation",
    };

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const data = await supabaseRequest<Record<string, unknown>[]>("awakening_registrations", {
          method: "POST",
          body: JSON.stringify(record),
          prefer: "return=representation",
        });
        if (!data[0]?.id) throw new Error("Registration was not acknowledged by storage.");
        return Response.json({ data: data[0] }, { status: 201 });
      } catch (saveError) {
        const recovered = await findExistingRegistration(email, paymentReference).catch(() => null);
        if (recovered) return Response.json({ data: recovered, recovered: true }, { status: 200 });
        if (attempt === 1) throw saveError;
      }
    }
    return Response.json({ error: "Registration could not be verified." }, { status: 502 });
  } catch {
    return Response.json(
      { error: "Your registration was not confirmed as saved. Nothing was charged or discarded—please retry with the same payment reference." },
      { status: 502 },
    );
  }
}
