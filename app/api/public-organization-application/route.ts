import { isSupabaseConfigured, supabaseRequest } from "../../supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Organization application storage is not configured." },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const required = ["name", "email", "phone", "business_name"];
    if (required.some((field) => !String(payload[field] ?? "").trim())) {
      return Response.json({ error: "Please complete all required business details." }, { status: 400 });
    }

    const employeeCount = Math.max(0, Number(payload.employee_count) || 0);
    const data = await supabaseRequest<Record<string, unknown>[]>(
      "awakening_organization_applications",
      {
        method: "POST",
        body: JSON.stringify({
          name: String(payload.name),
          email: String(payload.email),
          phone: String(payload.phone),
          business_name: String(payload.business_name),
          industry: String(payload.industry ?? ""),
          employee_count: employeeCount || null,
          discovery_source: String(payload.discovery_source ?? "Website"),
        }),
        prefer: "return=representation",
      },
    );
    return Response.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save your application." },
      { status: 502 },
    );
  }
}
