import { createCipheriv, createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { gzip } from "node:zlib";

const scrypt = promisify(scryptCallback);
const gzipAsync = promisify(gzip);

const tables = [
  "awakening_contacts",
  "awakening_documents",
  "awakening_galleries",
  "awakening_leads",
  "awakening_registrations",
  "awakening_schedules",
  "awakening_organization_applications",
  "awakening_staffing_applications",
  "awakening_sponsorship_applications",
  "awakening_rate_limits",
];

const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const secretKey = process.env.SUPABASE_SECRET_KEY;
const outputPath = process.argv[2] ?? `backups/supabase-${new Date().toISOString().replace(/[:.]/g, "-")}.json.gz.enc`;
const passphrase = process.env.BACKUP_PASSPHRASE ?? randomBytes(32).toString("base64url");
const maxPartBytes = 50 * 1024 * 1024;

if (!baseUrl || !secretKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
}

const authHeaders = {
  apikey: secretKey,
  authorization: `Bearer ${secretKey}`,
};

async function checkedFetch(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${init.method ?? "GET"} ${url} failed (${response.status}): ${detail}`);
  }
  return response;
}

async function exportTable(table) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const response = await checkedFetch(`${baseUrl}/rest/v1/${table}?select=*`, {
      headers: {
        ...authHeaders,
        range: `${offset}-${offset + pageSize - 1}`,
      },
    });
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function encodedObjectPath(bucket, objectPath) {
  return `${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

async function listStorageObjects(bucket, prefix = "") {
  const results = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const response = await checkedFetch(`${baseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ prefix, limit: pageSize, offset, sortBy: { column: "name", order: "asc" } }),
    });
    const page = await response.json();
    for (const entry of page) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (!entry.id && !entry.metadata) {
        results.push(...(await listStorageObjects(bucket, objectPath)));
      } else {
        const objectResponse = await checkedFetch(
          `${baseUrl}/storage/v1/object/authenticated/${encodedObjectPath(bucket, objectPath)}`,
          { headers: authHeaders },
        );
        results.push({
          path: objectPath,
          contentType: objectResponse.headers.get("content-type") ?? "application/octet-stream",
          bytesBase64: Buffer.from(await objectResponse.arrayBuffer()).toString("base64"),
        });
      }
    }
    if (page.length < pageSize) break;
  }
  return results;
}

async function exportStorage() {
  const response = await checkedFetch(`${baseUrl}/storage/v1/bucket`, { headers: authHeaders });
  const buckets = await response.json();
  const exported = [];
  for (const bucket of buckets) {
    exported.push({
      config: {
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types,
      },
      objects: await listStorageObjects(bucket.id),
    });
  }
  return exported;
}

const tableEntries = await Promise.all(
  tables.map(async (table) => [table, await exportTable(table)]),
);
const tableData = Object.fromEntries(tableEntries);

const payload = {
  formatVersion: 1,
  exportedAt: new Date().toISOString(),
  tables: tableData,
  storage: await exportStorage(),
};

const compressed = await gzipAsync(Buffer.from(JSON.stringify(payload)));
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = await scrypt(passphrase, salt, 32);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const ciphertext = Buffer.concat([cipher.update(compressed), cipher.final()]);
const envelope = {
  format: "awakening-supabase-backup",
  version: 1,
  encryption: "aes-256-gcm+scrypt",
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  authTag: cipher.getAuthTag().toString("base64"),
  ciphertext: ciphertext.toString("base64"),
};

await mkdir(new URL("../backups/", import.meta.url), { recursive: true });
const envelopeBytes = Buffer.from(`${JSON.stringify(envelope)}\n`);
let writtenPath = outputPath;
if (envelopeBytes.length > maxPartBytes) {
  const parts = [];
  for (let offset = 0, index = 0; offset < envelopeBytes.length; offset += maxPartBytes, index += 1) {
    const bytes = envelopeBytes.subarray(offset, offset + maxPartBytes);
    const path = `${outputPath}.part-${String(index).padStart(3, "0")}`;
    await writeFile(path, bytes, { mode: 0o600 });
    parts.push({
      file: path.split("/").at(-1),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  writtenPath = `${outputPath}.manifest.json`;
  await writeFile(
    writtenPath,
    `${JSON.stringify({ format: "awakening-supabase-backup-parts", version: 1, totalBytes: envelopeBytes.length, parts }, null, 2)}\n`,
    { mode: 0o600 },
  );
} else {
  await writeFile(outputPath, envelopeBytes, { mode: 0o600 });
}
await writeFile(".database-backup-key", `${passphrase}\n`, { mode: 0o600 });

const rowCount = Object.values(tableData).reduce((total, rows) => total + rows.length, 0);
const objectCount = payload.storage.reduce((total, bucket) => total + bucket.objects.length, 0);
console.log(`Encrypted ${rowCount} rows and ${objectCount} storage objects to ${writtenPath}.`);
console.log("The passphrase was saved locally to .database-backup-key and was not placed in the backup.");
