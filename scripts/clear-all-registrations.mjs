const requiredConfirmation = "DELETE_ALL_REGISTRATIONS";
if (process.env.AWAKENING_CONFIRM_DELETE !== requiredConfirmation) {
  throw new Error(`Set AWAKENING_CONFIRM_DELETE=${requiredConfirmation} to clear the live registration database.`);
}

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error("Awakening Server credentials are not configured.");

const headers = {
  apikey: secret,
  authorization: `Bearer ${secret}`,
  "content-type": "application/json",
};

async function checkedFetch(target, init = {}) {
  const response = await fetch(target, { ...init, headers: { ...headers, ...init.headers }, cache: "no-store" });
  if (!response.ok) throw new Error(`${init.method || "GET"} failed (${response.status}): ${await response.text()}`);
  return response;
}

const recordsResponse = await checkedFetch(`${url}/rest/v1/awakening_registrations?select=id,payment_proof_path&order=created_at.asc`, {
  headers: { prefer: "count=exact" },
});
const records = await recordsResponse.json();
const originalCount = Number(recordsResponse.headers.get("content-range")?.split("/").at(-1) || records.length);
const proofPaths = [...new Set(records.map((record) => String(record.payment_proof_path || "")).filter(Boolean))];

let deletedProofs = 0;
for (let index = 0; index < proofPaths.length; index += 50) {
  const batch = proofPaths.slice(index, index + 50);
  await checkedFetch(`${url}/storage/v1/object/payment-proofs`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: batch }),
  });
  deletedProofs += batch.length;
}

await checkedFetch(`${url}/rest/v1/awakening_registrations?id=not.is.null`, {
  method: "DELETE",
  headers: { prefer: "return=minimal" },
});

const verificationResponse = await checkedFetch(`${url}/rest/v1/awakening_registrations?select=id&limit=1`, {
  headers: { prefer: "count=exact" },
});
const remaining = Number(verificationResponse.headers.get("content-range")?.split("/").at(-1) || 0);
const remainingRows = await verificationResponse.json();
if (remaining !== 0 || remainingRows.length !== 0) {
  throw new Error(`Registration cleanup was incomplete: ${remaining} record(s) remain.`);
}

console.log(JSON.stringify({
  ok: true,
  registrationsDeleted: originalCount,
  paymentProofFilesDeleted: deletedProofs,
  remainingRegistrations: remaining,
}, null, 2));
