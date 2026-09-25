import { createDecipheriv, createHash, scrypt as scryptCallback } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { gunzip } from "node:zlib";

const scrypt = promisify(scryptCallback);
const gunzipAsync = promisify(gunzip);

const backupPath = process.argv[2];
const apply = process.argv.includes("--apply");
const verifyOnly = process.argv.includes("--verify-only");
const baseUrl = process.env.RESTORE_SUPABASE_URL?.replace(/\/$/, "");
const secretKey = process.env.RESTORE_SUPABASE_SECRET_KEY;
let passphrase = process.env.BACKUP_PASSPHRASE;
if (!passphrase) {
  try {
    passphrase = (await readFile(".database-backup-key", "utf8")).trim();
  } catch {
    // The explicit error below explains how to supply the missing key.
  }
}

if (!backupPath || !passphrase) {
  throw new Error("Provide a backup path and BACKUP_PASSPHRASE.");
}

async function readBackupEnvelope(path) {
  const firstFile = await readFile(path);
  const parsed = JSON.parse(firstFile.toString("utf8"));
  if (parsed.format !== "awakening-supabase-backup-parts") return parsed;
  const partBytes = [];
  for (const part of parsed.parts) {
    const bytes = await readFile(join(dirname(path), part.file));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== part.sha256 || bytes.length !== part.bytes) {
      throw new Error(`Backup part failed integrity verification: ${part.file}`);
    }
    partBytes.push(bytes);
  }
  const combined = Buffer.concat(partBytes);
  if (combined.length !== parsed.totalBytes) throw new Error("Backup parts are incomplete.");
  return JSON.parse(combined.toString("utf8"));
}

const envelope = await readBackupEnvelope(backupPath);
if (envelope.format !== "awakening-supabase-backup" || envelope.version !== 1) {
  throw new Error("Unsupported backup format.");
}

const salt = Buffer.from(envelope.salt, "base64");
const iv = Buffer.from(envelope.iv, "base64");
const key = await scrypt(passphrase, salt, 32);
const decipher = createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
const compressed = Buffer.concat([
  decipher.update(Buffer.from(envelope.ciphertext, "base64")),
  decipher.final(),
]);
const payload = JSON.parse((await gunzipAsync(compressed)).toString("utf8"));

if (verifyOnly) {
  const rowCount = Object.values(payload.tables).reduce((total, rows) => total + rows.length, 0);
  const objectCount = payload.storage.reduce((total, bucket) => total + bucket.objects.length, 0);
  console.log(`Verified snapshot from ${payload.exportedAt}: ${rowCount} rows and ${objectCount} storage objects.`);
  process.exit(0);
}

if (!baseUrl || !secretKey) {
  throw new Error("RESTORE_SUPABASE_URL and RESTORE_SUPABASE_SECRET_KEY are required for restoration.");
}
if (!apply) throw new Error("Restore is destructive. Re-run with --apply after verifying the target project.");

const authHeaders = {
  apikey: secretKey,
  ...(!secretKey.startsWith("sb_") && { authorization: `Bearer ${secretKey}` }),
};

async function checkedFetch(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${init.method ?? "GET"} ${url} failed (${response.status}): ${detail}`);
  }
  return response;
}

const deleteFilters = {
  awakening_contacts: "id=not.is.null",
  awakening_documents: "id=not.is.null",
  awakening_galleries: "id=not.is.null",
  awakening_leads: "id=not.is.null",
  awakening_registrations: "id=not.is.null",
  awakening_schedules: "id=not.is.null",
  awakening_organization_applications: "id=not.is.null",
  awakening_staffing_applications: "id=not.is.null",
  awakening_sponsorship_applications: "id=not.is.null",
  awakening_rate_limits: "scope=not.is.null",
};

for (const [table, rows] of Object.entries(payload.tables)) {
  const filter = deleteFilters[table];
  if (!filter) throw new Error(`Refusing to restore unknown table: ${table}`);
  await checkedFetch(`${baseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: { ...authHeaders, prefer: "return=minimal" },
  });
  for (let offset = 0; offset < rows.length; offset += 500) {
    await checkedFetch(`${baseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json", prefer: "return=minimal" },
      body: JSON.stringify(rows.slice(offset, offset + 500)),
    });
  }
}

function encodedObjectPath(bucket, objectPath) {
  return `${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

async function listStorageObjects(bucket, prefix = "") {
  const response = await checkedFetch(`${baseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  const results = [];
  for (const entry of await response.json()) {
    const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (!entry.id && !entry.metadata) results.push(...(await listStorageObjects(bucket, objectPath)));
    else results.push(objectPath);
  }
  return results;
}

for (const bucket of payload.storage) {
  const existingBuckets = await checkedFetch(`${baseUrl}/storage/v1/bucket`, { headers: authHeaders });
  const exists = (await existingBuckets.json()).some((entry) => entry.id === bucket.config.id);
  const bucketBody = {
    id: bucket.config.id,
    name: bucket.config.name,
    public: bucket.config.public,
    file_size_limit: bucket.config.fileSizeLimit,
    allowed_mime_types: bucket.config.allowedMimeTypes,
  };
  await checkedFetch(
    exists
      ? `${baseUrl}/storage/v1/bucket/${encodeURIComponent(bucket.config.id)}`
      : `${baseUrl}/storage/v1/bucket`,
    {
      method: exists ? "PUT" : "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify(bucketBody),
    },
  );

  const existingObjects = await listStorageObjects(bucket.config.id);
  if (existingObjects.length) {
    await checkedFetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket.config.id)}`, {
      method: "DELETE",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ prefixes: existingObjects }),
    });
  }

  for (const object of bucket.objects) {
    await checkedFetch(`${baseUrl}/storage/v1/object/${encodedObjectPath(bucket.config.id, object.path)}`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": object.contentType, "x-upsert": "true" },
      body: Buffer.from(object.bytesBase64, "base64"),
    });
  }
}

console.log(`Restored snapshot exported at ${payload.exportedAt}.`);
