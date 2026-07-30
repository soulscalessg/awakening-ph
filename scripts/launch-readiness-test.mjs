import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.AWAKENING_TEST_URL || "https://awakening-ph-official.soulscalegroup.workers.dev";
const count = Number(process.env.AWAKENING_TEST_COUNT || 100);
const concurrency = Number(process.env.AWAKENING_TEST_CONCURRENCY || 4);
const prefix = process.env.AWAKENING_TEST_PREFIX || `LAUNCH-${Date.now()}`;

if (process.env.AWAKENING_CONFIRM_LIVE !== "yes") {
  throw new Error("Set AWAKENING_CONFIRM_LIVE=yes to run the live registration test.");
}
if (!Number.isInteger(count) || count < 1 || count > 100) {
  throw new Error("AWAKENING_TEST_COUNT must be an integer between 1 and 100.");
}

async function jsonRequest(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return { response, body, bytes: Buffer.byteLength(text) };
}

const proofBytes = await readFile(resolve("public/awakening/gcash-payment-qr.png"));
const paymentProofData = `data:image/png;base64,${proofBytes.toString("base64")}`;
const scheduleResponse = await jsonRequest("/api/public-schedules", { cache: "no-store" });
const schedules = scheduleResponse.body.data;
if (!Array.isArray(schedules) || schedules.length < 1) throw new Error("No published schedules are available.");

const startedAt = Date.now();
const payloads = Array.from({ length: count }, (_, index) => {
  const number = index + 1;
  const schedule = schedules[index % schedules.length];
  const serial = String(number).padStart(3, "0");
  const quantity = (index % 3) + 1;
  return {
    name: `Test${number}`,
    email: `launch-test-${prefix.toLowerCase()}-${serial}@example.com`,
    phone: `+63 917 555 ${String(number).padStart(4, "0")}`,
    schedule_id: schedule.id,
    event_date: schedule.event_at,
    quantity,
    payment_method: index % 2 === 0 ? "gcash" : "bank",
    payment_reference: `${prefix}-${serial}`,
    payment_proof_name: `Test${number}-payment-proof.png`,
    payment_proof_data: paymentProofData,
  };
});

const results = new Array(payloads.length);
let nextIndex = 0;
async function worker() {
  while (true) {
    const index = nextIndex++;
    if (index >= payloads.length) return;
    const payload = payloads[index];
    const checkoutStart = Date.now();
    const checkout = await jsonRequest("/api/registration-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const submitStart = Date.now();
    const registration = await jsonRequest("/api/public-registration", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    results[index] = {
      number: index + 1,
      checkoutMs: submitStart - checkoutStart,
      submitMs: Date.now() - submitStart,
      checkoutRemaining: checkout.body.remaining,
      status: registration.response.status,
      id: registration.body.data?.id,
      code: registration.body.data?.code,
    };
    if (!results[index].id || !results[index].code) throw new Error(`Test${index + 1} was not acknowledged with an id and code.`);
    if ((index + 1) % 10 === 0) console.log(`created ${index + 1}/${count}`);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, count) }, () => worker()));

// Prove idempotency: the exact same registration must return the same record, not create a duplicate.
const duplicate = await jsonRequest("/api/public-registration", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payloads[0]),
});
if (!duplicate.body.duplicate || duplicate.body.data?.id !== results[0].id) {
  throw new Error("Idempotent retry did not recover the original Test1 registration.");
}

// Prove the checkout throttle works without creating another registration.
const throttlePayload = { ...payloads[0], email: `rate-limit-${prefix.toLowerCase()}@example.com` };
const throttleStatuses = [];
for (let index = 0; index < 7; index += 1) {
  const response = await fetch(`${baseUrl}/api/registration-checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(throttlePayload),
  });
  throttleStatuses.push(response.status);
}
if (throttleStatuses.at(-1) !== 429) throw new Error(`Checkout rate limit did not return 429: ${throttleStatuses.join(",")}`);

const username = process.env.PLATFORM_ADMIN_USERNAME;
const password = process.env.PLATFORM_ADMIN_PASSWORD;
if (!username || !password) throw new Error("Admin credentials are required for post-write verification.");
const login = await jsonRequest("/api/platform-login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ username, password }),
});
const cookie = login.response.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Admin login did not return a session cookie.");

const adminRegistrations = await jsonRequest("/api/platform-data/registrations", { headers: { cookie }, cache: "no-store" });
const created = adminRegistrations.body.data.filter((record) => String(record.payment_reference || "").startsWith(prefix));
if (created.length !== count) throw new Error(`Expected ${count} test rows, found ${created.length}.`);
if (JSON.stringify(adminRegistrations.body).includes("payment_proof_name") || JSON.stringify(adminRegistrations.body).includes("data:image/")) {
  throw new Error("The lightweight admin feed still contains payment-proof image data.");
}

const recordByReference = new Map(created.map((record) => [record.payment_reference, record]));
const fieldErrors = [];
for (const [index, payload] of payloads.entries()) {
  const record = recordByReference.get(payload.payment_reference);
  const expectedAmount = 1499 * payload.quantity;
  const checks = {
    name: record?.name === payload.name,
    email: record?.email === payload.email,
    phone: record?.phone === payload.phone,
    schedule_id: record?.schedule_id === payload.schedule_id,
    quantity: Number(record?.quantity) === payload.quantity,
    total_amount: Number(record?.total_amount) === expectedAmount,
    payment_method: record?.payment_method === payload.payment_method,
    payment_reference: record?.payment_reference === payload.payment_reference,
    payment_proof_path: String(record?.payment_proof_path || "").startsWith("registrations/"),
    payment_proof_mime_type: record?.payment_proof_mime_type === "image/png",
    status: record?.status === "for_confirmation",
    event_date: Boolean(record?.event_date),
    code: Boolean(record?.code),
    id: Boolean(record?.id),
  };
  const failed = Object.entries(checks).filter(([, valid]) => !valid).map(([field]) => field);
  if (failed.length) fieldErrors.push({ test: index + 1, failed });
}
if (fieldErrors.length) throw new Error(`Field verification failed: ${JSON.stringify(fieldErrors.slice(0, 10))}`);

const proofSamples = [1, 25, 50, 75, 100].filter((number) => number <= count);
const proofChecks = [];
for (const number of proofSamples) {
  const record = recordByReference.get(payloads[number - 1].payment_reference);
  const preview = await jsonRequest(`/api/payment-proof?registration_id=${encodeURIComponent(record.id)}`, { headers: { cookie }, cache: "no-store" });
  const image = await fetch(preview.body.url, { cache: "no-store" });
  const bytes = new Uint8Array(await image.arrayBuffer());
  const pngMagic = bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (!image.ok || !pngMagic) throw new Error(`Payment proof preview failed for Test${number}.`);
  proofChecks.push({ test: number, status: image.status, mime: image.headers.get("content-type"), bytes: bytes.length, signed: String(preview.body.url).includes("/storage/v1/object/sign/") });
}

// Exercise archive and restore using the same endpoint the dashboard controls use.
const archiveRecord = recordByReference.get(payloads.at(-1).payment_reference);
await jsonRequest(`/api/platform-data/registrations?id=${encodeURIComponent(archiveRecord.id)}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify({ status: "archived_for_confirmation" }),
});
const restore = await jsonRequest(`/api/platform-data/registrations?id=${encodeURIComponent(archiveRecord.id)}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify({ status: "for_confirmation" }),
});
if (restore.body.data?.status !== "for_confirmation") throw new Error("Archive/restore verification failed.");

const durations = results.map((result) => result.submitMs).sort((a, b) => a - b);
const percentile = (p) => durations[Math.min(durations.length - 1, Math.floor(durations.length * p))];
const methodCounts = created.reduce((totals, record) => {
  totals[record.payment_method] = (totals[record.payment_method] || 0) + 1;
  return totals;
}, {});
const scheduleIds = new Set(created.map((record) => record.schedule_id));
const codes = new Set(created.map((record) => record.code));
const references = new Set(created.map((record) => record.payment_reference));

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  prefix,
  requested: count,
  created: created.length,
  uniqueCodes: codes.size,
  uniqueReferences: references.size,
  schedulesCovered: scheduleIds.size,
  publishedSchedules: schedules.length,
  paymentMethods: methodCounts,
  quantities: created.reduce((totals, record) => { totals[record.quantity] = (totals[record.quantity] || 0) + 1; return totals; }, {}),
  totalSubmittedValue: created.reduce((sum, record) => sum + Number(record.total_amount || 0), 0),
  adminFeedBytes: adminRegistrations.bytes,
  proofChecks,
  idempotentRetry: duplicate.body.duplicate === true,
  archiveAndRestore: true,
  checkoutRateLimitStatuses: throttleStatuses,
  submitLatencyMs: { min: durations[0], median: percentile(0.5), p95: percentile(0.95), max: durations.at(-1) },
  elapsedMs: Date.now() - startedAt,
}, null, 2));
