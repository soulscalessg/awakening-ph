import { authorizePlatformRequest } from "../../platform-auth";
import {
  createPrivateObjectSignedUrl,
  isSupabaseConfigured,
  supabaseRequest,
} from "../../supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await authorizePlatformRequest(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Awakening Server is unavailable." }, { status: 503 });
  }

  const registrationId = new URL(request.url).searchParams.get("registration_id") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(registrationId)) {
    return Response.json({ error: "A valid registration is required." }, { status: 400 });
  }

  try {
    const records = await supabaseRequest<{
      payment_proof_path?: string;
      payment_proof_name?: string;
      payment_proof_mime_type?: string;
    }[]>(
      `awakening_registrations?select=payment_proof_path,payment_proof_name,payment_proof_mime_type&id=eq.${encodeURIComponent(registrationId)}&limit=1`,
    );
    const record = records[0];
    if (!record?.payment_proof_path) {
      return Response.json({ error: "Image not available." }, { status: 404 });
    }
    const url = await createPrivateObjectSignedUrl("payment-proofs", record.payment_proof_path, 300);
    return Response.json({
      url,
      name: record.payment_proof_name || "Payment proof",
      mime_type: record.payment_proof_mime_type || "image/jpeg",
      expires_in: 300,
    });
  } catch {
    return Response.json({ error: "Image not available." }, { status: 404 });
  }
}
