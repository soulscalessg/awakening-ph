import { takeRateLimit } from "../../rate-limit";
import {
  deletePrivateObject,
  isSupabaseConfigured,
  supabaseRequest,
  uploadPrivateObject,
} from "../../supabase-server";
import { scheduleOptionLabel, type PublicSchedule } from "../../schedule-format";

export const dynamic = "force-dynamic";

const TICKET_PRICE = 1499;
const PAYMENT_PROOF_BUCKET = "payment-proofs";
const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const proofExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

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

function decodeProof(dataUri: string) {
  const match = /^data:(image\/(?:jpeg|png|webp|heic|heif));base64,([a-z0-9+/=\s]+)$/i.exec(dataUri);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  if (!proofExtensions[mimeType]) return null;
  let binary = "";
  try {
    binary = atob(match[2].replace(/\s/g, ""));
  } catch {
    return null;
  }
  if (!binary.length || binary.length > MAX_PROOF_BYTES) return null;
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const isJpeg = mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = mimeType === "image/png" && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  const isWebp = mimeType === "image/webp" && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const heifBrand = String.fromCharCode(...bytes.slice(4, 12));
  const isHeif = (mimeType === "image/heic" || mimeType === "image/heif") && heifBrand.startsWith("ftyp");
  return isJpeg || isPng || isWebp || isHeif ? { bytes, mimeType } : null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Registration storage is not configured." },
      { status: 503 },
    );
  }

  let uploadedPath = "";
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = text(payload.name, 160);
    const email = text(payload.email, 254).toLowerCase();
    const phone = text(payload.phone, 40);
    const submittedEventDate = text(payload.event_date, 300);
    const scheduleId = text(payload.schedule_id, 80);
    const paymentMethod = text(payload.payment_method, 20).toLowerCase();
    const paymentReference = text(payload.payment_reference, 120);
    const paymentProofName = text(payload.payment_proof_name, 220);
    const paymentProofData = String(payload.payment_proof_data ?? "");
    const quantity = Math.min(20, Math.max(1, Math.trunc(Number(payload.quantity) || 1)));

    if (!name || !email || !phone || !submittedEventDate || !scheduleId || !paymentReference || !paymentProofName || !paymentProofData) {
      return Response.json({ error: "Required registration details are missing." }, { status: 400 });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(scheduleId)) {
      return Response.json({ error: "Choose a valid published schedule." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!new Set(["gcash", "bank"]).has(paymentMethod)) {
      return Response.json({ error: "Choose GCash or bank transfer." }, { status: 400 });
    }
    const proof = decodeProof(paymentProofData);
    if (!proof) return Response.json({ error: "Upload a valid JPG, PNG, WebP, HEIC, or HEIF payment proof up to 5 MB." }, { status: 400 });

    const matchingSchedules = await supabaseRequest<PublicSchedule[]>(
      `awakening_schedules?select=id,event_at,ends_at,venue,city,capacity,status,timezone,country_code&id=eq.${encodeURIComponent(scheduleId)}&status=eq.scheduled&limit=1`,
    );
    const matchingSchedule = matchingSchedules[0];
    if (!matchingSchedule) {
      return Response.json(
        { error: "That schedule is no longer available. Please select another date." },
        { status: 409 },
      );
    }
    const eventDate = scheduleOptionLabel(matchingSchedule);

    const existing = await findExistingRegistration(email, paymentReference);
    if (existing) {
      return Response.json({ data: existing, duplicate: true }, { status: 200 });
    }

    const rate = await takeRateLimit(request, "registration-submit", 5, 3600, email);
    if (!rate.allowed) {
      return Response.json(
        { error: "Too many registration attempts. Please wait before trying again with the same details." },
        { status: 429, headers: { "retry-after": String(rate.retry_after_seconds) } },
      );
    }

    uploadedPath = `registrations/${crypto.randomUUID()}/payment-proof.${proofExtensions[proof.mimeType]}`;
    await uploadPrivateObject(PAYMENT_PROOF_BUCKET, uploadedPath, proof.bytes, proof.mimeType);

    const record = {
      name,
      email,
      phone,
      schedule_id: scheduleId,
      event_date: eventDate,
      quantity,
      total_amount: TICKET_PRICE * quantity,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      payment_proof_name: paymentProofName,
      payment_proof_path: uploadedPath,
      payment_proof_mime_type: proof.mimeType,
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
        if (recovered) {
          if (String(recovered.payment_proof_path ?? "") !== uploadedPath) {
            await deletePrivateObject(PAYMENT_PROOF_BUCKET, uploadedPath).catch(() => undefined);
          }
          return Response.json({ data: recovered, recovered: true }, { status: 200 });
        }
        if (attempt === 1) throw saveError;
      }
    }
    return Response.json({ error: "Registration could not be verified." }, { status: 502 });
  } catch {
    if (uploadedPath) await deletePrivateObject(PAYMENT_PROOF_BUCKET, uploadedPath).catch(() => undefined);
    return Response.json(
      { error: "Your registration was not confirmed as saved. Nothing was charged or discarded—please retry with the same payment reference." },
      { status: 502 },
    );
  }
}
