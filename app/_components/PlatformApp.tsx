"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { formatScheduleRange, scheduleFlag, type PublicSchedule } from "../schedule-format";

type PlatformPage =
  | "system-information"
  | "account"
  | "contacts"
  | "document-hub"
  | "sales-revenue"
  | "crm"
  | "registration-center"
  | "seminar-schedule-management"
  | "latest-schedules"
  | "applications-organizations"
  | "applications-staffing"
  | "applications-sponsorship";

const schedules = [
  { event_at: "2026-05-30T09:00:00+08:00", venue: "Davao", city: "Davao", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-05-31T09:00:00+08:00", venue: "General Santos", city: "General Santos", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-06-20T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Pasig", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-07-18T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Pasig", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-07-27T09:00:00+08:00", venue: "Cebu", city: "Cebu", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-08-15T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-08-22T09:00:00+08:00", venue: "Manila", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-08-22T09:00:00+08:00", venue: "Olongapo", city: "Olongapo", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-09-06T09:00:00+08:00", venue: "La Union", city: "La Union", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-09-12T09:00:00+08:00", venue: "Rizal", city: "Rizal", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-09-20T09:00:00+08:00", venue: "Manila", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-09-26T09:00:00+08:00", venue: "Pampanga", city: "Pampanga", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-10-03T09:00:00+08:00", venue: "Tarlac", city: "Tarlac", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-10-03T09:00:00+08:00", venue: "Manila", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-10-11T09:00:00+01:00", venue: "United Kingdom", city: "United Kingdom", status: "scheduled", timezone: "Europe/London", country_code: "GB" },
  { event_at: "2026-10-17T09:00:00+08:00", venue: "Laguna", city: "Laguna", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-10-26T09:00:00+08:00", ends_at: "2026-10-31T17:00:00+08:00", venue: "Koronadal", city: "Koronadal", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-11-01T09:00:00+08:00", venue: "Tagaytay", city: "Tagaytay", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-11-07T09:00:00+08:00", venue: "Marikina", city: "Marikina", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-11-20T09:00:00+08:00", ends_at: "2026-11-23T17:00:00+08:00", venue: "Singapore", city: "Singapore", status: "scheduled", timezone: "Asia/Singapore", country_code: "SG" },
  { event_at: "2026-11-21T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-11-28T09:00:00+08:00", venue: "Quezon", city: "Quezon", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
  { event_at: "2026-12-05T09:00:00+08:00", venue: "Manila", city: "Manila", status: "scheduled", timezone: "Asia/Manila", country_code: "PH" },
] as const;

const registrants = [
  { code: "DNFHO2", date: "August 15 (Manila)", name: "Jerold Mark Villafuerte", email: "normingh@atarashiitechnologies.co", phone: "09952603643", status: "For Confirmation" },
  { code: "OVCOHL", date: "July 26 (Manila)", name: "Jean Francia", email: "jeanfrancia0695@gmail.com", phone: "+63 994 644 1071", status: "Paid" },
  { code: "L8V6Y7", date: "July 26 (Manila)", name: "Mark Ysrael Ilagan", email: "markysrael06@gmail.com", phone: "+63 626 273 271", status: "Paid" },
];

const navSections = [
  { label: "Registration Dashboard", icon: "◈", href: "/platform", pages: ["registration-center"] },
  { label: "Schedule Manager", icon: "◷", href: "/platform/seminar-schedule-management", pages: ["seminar-schedule-management"] },
  { label: "Organization Inquiries", icon: "◇", href: "/platform/applications/organizations", pages: ["applications-organizations"] },
  { label: "Account Settings", icon: "⚙", href: "/platform/account", pages: ["account"] },
  { label: "My Platform", icon: "◫", pages: ["system-information"], children: [["System Information", "/platform/system-information", "system-information"]] },
  { label: "Resources", icon: "▣", pages: ["contacts", "document-hub"], children: [["Contacts", "/platform/contacts", "contacts"], ["Document Hub", "/platform/document-hub", "document-hub"]] },
  { label: "Sales & Administration", icon: "◌", pages: ["sales-revenue", "crm"], children: [["Profit & Sales Manager", "/platform/sales-revenue", "sales-revenue"], ["Customer Relationship Manager", "/platform/crm", "crm"]] },
  { label: "Latest Schedules", icon: "▢", href: "/platform/latest-schedules", pages: ["latest-schedules"] },
  { label: "Other Applications", icon: "◧", pages: ["applications-staffing", "applications-sponsorship"], children: [["For Staffing Team", "/platform/applications/staffing", "applications-staffing"], ["For Sponsorship", "/platform/applications/sponsorship", "applications-sponsorship"]] },
] as const;

type StoredRecord = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  venue?: string;
  event_at?: string;
  ends_at?: string | null;
  event_date?: string;
  code?: string;
  status?: string;
  created_at?: string;
  quantity?: number;
  total_amount?: number | string;
  city?: string;
  capacity?: number;
  timezone?: string;
  country_code?: string;
  schedule_id?: string;
  business_name?: string;
  industry?: string;
  employee_count?: number;
  payment_method?: string;
  payment_reference?: string;
  payment_proof_name?: string;
  organization?: string;
  source?: string;
  stage?: string;
  value?: number;
  discovery_source?: string;
  facebook_url?: string;
  products?: string;
  file_url?: string;
  category?: string;
  notes?: string;
  [key: string]: unknown;
};

function asPublicSchedule(record: StoredRecord): PublicSchedule {
  return {
    id: String(record.id ?? `${record.event_at}-${record.venue}`),
    event_at: String(record.event_at ?? ""),
    ends_at: record.ends_at ? String(record.ends_at) : null,
    venue: String(record.venue ?? "Venue pending"),
    city: record.city ? String(record.city) : null,
    capacity: Number(record.capacity) || null,
    status: String(record.status ?? "scheduled"),
    timezone: String(record.timezone ?? "Asia/Manila"),
    country_code: String(record.country_code ?? "PH"),
  };
}

function formatRecordPart(record: StoredRecord, options: Intl.DateTimeFormatOptions) {
  if (!record.event_at) return "";
  return new Intl.DateTimeFormat("en-PH", {
    ...options,
    timeZone: String(record.timezone ?? "Asia/Manila"),
  }).format(new Date(record.event_at));
}

function toZonedDateTimeLocal(iso: unknown, timeZone: unknown) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: String(timeZone || "Asia/Manila"),
  }).formatToParts(new Date(String(iso)));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
}

function zonedDateTimeToIso(localValue: string, timeZone: string) {
  if (!localValue) return null;
  const [datePart, timePart] = localValue.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let guess = desired;
  for (let index = 0; index < 3; index += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).formatToParts(new Date(guess));
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value || 0);
    const represented = Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
      value("second"),
    );
    guess += desired - represented;
  }
  return new Date(guess).toISOString();
}

function usePlatformRecords(resource: string, initial: StoredRecord[] = []) {
  const [records, setRecords] = useState<StoredRecord[]>(initial);
  const [connection, setConnection] = useState<"connecting" | "live" | "unavailable">("connecting");

  useEffect(() => {
    let active = true;
    const loadRecords = () => {
      fetch(`/api/platform-data/${resource}`, { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) throw new Error("Data unavailable");
          const result = (await response.json()) as { data?: StoredRecord[] };
          if (active) {
            setRecords(result.data ?? []);
            setConnection("live");
          }
        })
        .catch(() => {
          if (active) setConnection("unavailable");
        });
    };
    loadRecords();
    const refreshEvery = resource === "registrations" ? 3_000 : resource === "schedules" ? 10_000 : 0;
    const timer = refreshEvery ? window.setInterval(loadRecords, refreshEvery) : undefined;
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [resource]);

  async function createRecord(payload: StoredRecord) {
    const response = await fetch(`/api/platform-data/${resource}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Unable to save this record.");
    const result = (await response.json()) as { data: StoredRecord };
    setRecords((current) => [result.data, ...current]);
    setConnection("live");
    return result.data;
  }

  async function deleteRecord(id?: string) {
    if (!id) return;
    const response = await fetch(`/api/platform-data/${resource}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Unable to delete this record.");
    setRecords((current) => current.filter((record) => record.id !== id));
  }

  async function updateRecord(id: string | undefined, payload: StoredRecord) {
    if (!id) throw new Error("Record id is required.");
    const response = await fetch(`/api/platform-data/${resource}?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Unable to update this record.");
    const result = (await response.json()) as { data: StoredRecord };
    setRecords((current) => current.map((record) => record.id === id ? result.data : record));
    setConnection("live");
    return result.data;
  }

  return { records, connection, createRecord, updateRecord, deleteRecord };
}

function DataConnectionBadge({ state }: { state: "connecting" | "live" | "unavailable" }) {
  const labels = { connecting: "Connecting to Awakening Server", live: "Awakening Server Online", unavailable: "Awakening Server Unavailable" };
  return <span className={`platform-data-state ${state}`}><i aria-hidden="true" />{labels[state]}</span>;
}

function PlatformShell({ page, children }: { page: PlatformPage; children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  return (
    <div className={`platform-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <header className="platform-topbar">
        <button
          className="platform-menu-button"
          type="button"
          aria-label="Toggle navigation sidebar"
          aria-pressed={sidebarCollapsed || mobileNav}
          onClick={() => {
            if (window.matchMedia("(max-width: 900px)").matches) setMobileNav((open) => !open);
            else setSidebarCollapsed((collapsed) => !collapsed);
          }}
        ><span aria-hidden="true">{sidebarCollapsed ? "→" : "←"}</span></button>
        <Link href="/platform" className="platform-brand" aria-label="Awakening platform home"><img src="/awakening/logo-transparent-2026.png" alt="Awakening" /><span>Control Room</span></Link>
        <div className="platform-topbar-actions">
          <Link href="/" target="_blank">View public site ↗</Link>
          <button
          className="platform-avatar"
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={async () => {
            await fetch("/api/platform-logout", { method: "POST" });
            window.location.href = "/";
          }}
          >AN</button>
        </div>
      </header>
      <aside className={`platform-sidebar ${mobileNav ? "is-open" : ""}`}>
        <nav aria-label="Platform navigation">
          {navSections.map((section) => {
            const expanded = section.pages.includes(page as never);
            const manuallyOpen = openGroups.includes(section.label);
            return (
              <div className={`platform-nav-group ${expanded || manuallyOpen ? "is-expanded" : ""}`} key={section.label}>
                {"href" in section ? (
                  <Link className={expanded ? "is-active" : ""} href={section.href} onClick={() => setMobileNav(false)}><span>{section.icon}</span><b>{section.label}</b></Link>
                ) : (
                  <button
                    className="platform-nav-parent"
                    type="button"
                    aria-expanded={expanded || manuallyOpen}
                    onClick={() => setOpenGroups((current) => current.includes(section.label) ? current.filter((label) => label !== section.label) : [...current, section.label])}
                  ><span>{section.icon}</span><b>{section.label}</b><i>{expanded || manuallyOpen ? "⌄" : "›"}</i></button>
                )}
                {"children" in section && (expanded || manuallyOpen) && (
                  <div className="platform-subnav">
                    {section.children.map(([label, href, childPage]) => (
                      <Link className={page === childPage ? "is-active" : ""} href={href} key={href} onClick={() => setMobileNav(false)}>{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="platform-main">{children}</main>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="platform-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function EmptyState({ message = "No results found. Please adjust your filter." }: { message?: string }) {
  return <div className="platform-empty"><span aria-hidden="true">▱</span><p>{message}</p></div>;
}

function GradientBanner({ children, variant = "blue" }: { children?: ReactNode; variant?: "blue" | "rainbow" | "pink" }) {
  return <section className={`platform-banner ${variant}`}>{children}</section>;
}

function PageIntro({ title, copy, action, search, onSearch, onAction }: { title: string; copy?: string; action?: string; search?: string; onSearch?: (value: string) => void; onAction?: () => void }) {
  return (
    <div className="platform-page-intro">
      <div><h1>{title}</h1>{copy && <p>{copy}</p>}</div>
      <div className="platform-intro-actions">{onSearch && <SearchBar value={search ?? ""} onChange={onSearch} />}{action && <button className="platform-primary" type="button" onClick={onAction}>＋ {action}</button>}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <article className="platform-metric"><span>{label}</span><strong>{value}</strong></article>;
}

type QuickLink = string | { label: string; href: string };
function QuickLinks({ items }: { items: QuickLink[] }) {
  return <div className="platform-quick-links">{items.map((item) => {
    const label = typeof item === "string" ? item : item.label;
    const content = <><span>◉</span><b>{label}</b><i>›</i></>;
    return typeof item === "string" ? <button type="button" key={label}>{content}</button> : <Link href={item.href} key={item.href}>{content}</Link>;
  })}</div>;
}

function Modal({ title, onClose, onSave }: { title: string; onClose: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="platform-modal" onSubmit={onSave} onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>{title}</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
        <label>Name<input name="name" required placeholder="Full name" /></label>
        <label>Email address<input name="email" type="email" required placeholder="name@example.com" /></label>
        <label>Contact number<input name="phone" placeholder="+63" /></label>
        <footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" type="submit">Save record</button></footer>
      </form>
    </div>
  );
}

function ScheduleModal({ record, onClose, onSave }: { record?: StoredRecord; onClose: () => void; onSave: (payload: StoredRecord) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [timeZone, setTimeZone] = useState(String(record?.timezone ?? "Asia/Manila"));
  const [countryCode, setCountryCode] = useState(String(record?.country_code ?? "PH"));
  const localEventAt = toZonedDateTimeLocal(record?.event_at, timeZone);
  const localEndsAt = toZonedDateTimeLocal(record?.ends_at, timeZone);

  return (
    <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="platform-modal schedule-editor-modal" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        setError("");
        const selectedTimeZone = String(data.get("timezone") || "Asia/Manila");
        const endValue = String(data.get("ends_at") || "");
        void onSave({
          event_at: zonedDateTimeToIso(String(data.get("event_at")), selectedTimeZone) ?? undefined,
          ends_at: endValue ? zonedDateTimeToIso(endValue, selectedTimeZone) : null,
          venue: String(data.get("venue")),
          city: String(data.get("city")),
          capacity: Math.max(0, Number(data.get("capacity")) || 0),
          status: String(data.get("status") || "scheduled"),
          timezone: selectedTimeZone,
          country_code: String(data.get("country_code") || "PH"),
        }).catch(() => setError("This schedule could not be saved. Please check the details and try again.")).finally(() => setSaving(false));
      }} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span className="admin-eyebrow">Public schedule</span><h2>{record ? "Edit session" : "Create a session"}</h2></div><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
        <p>Publishing a session updates Latest Schedules and Secure My Slot automatically.</p>
        <div className="schedule-editor-grid"><label>Starts<input name="event_at" type="datetime-local" required defaultValue={localEventAt} /></label><label>Ends (optional)<input name="ends_at" type="datetime-local" defaultValue={localEndsAt} /></label></div>
        <label>Venue<input name="venue" required defaultValue={record?.venue ?? ""} placeholder="House of Transformation, Ayala the 30th" /></label>
        <div className="schedule-editor-grid"><label>City<input name="city" defaultValue={record?.city ?? ""} placeholder="Pasig" /></label><label>Capacity<input name="capacity" type="number" min="0" defaultValue={record?.capacity ?? ""} placeholder="100" /></label></div>
        <div className="schedule-editor-grid">
          <label>Country<select name="country_code" value={countryCode} onChange={(event) => { const value = event.target.value; setCountryCode(value); setTimeZone(value === "GB" ? "Europe/London" : value === "SG" ? "Asia/Singapore" : "Asia/Manila"); }}><option value="PH">Philippines 🇵🇭</option><option value="GB">United Kingdom 🇬🇧</option><option value="SG">Singapore 🇸🇬</option></select></label>
          <label>Time zone<select name="timezone" value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option value="Asia/Manila">Asia / Manila</option><option value="Asia/Singapore">Asia / Singapore</option><option value="Europe/London">Europe / London</option></select></label>
        </div>
        <label>Publishing status<select name="status" defaultValue={record?.status ?? "scheduled"}><option value="scheduled">Published</option><option value="draft">Draft</option><option value="cancelled">Cancelled</option></select></label>
        {error && <div className="platform-inline-error" role="alert">{error}</div>}
        <footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : record ? "Save changes" : "Publish schedule"}</button></footer>
      </form>
    </div>
  );
}

type ExtractedSchedule = {
  event_at: string;
  ends_at: string | null;
  venue: string;
  city: string;
  capacity: number;
  status: string;
  timezone: string;
  country_code: string;
};

const scheduleMonths: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
  may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8,
  sep: 8, sept: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
};

const philippineCities = ["Manila", "Pasig", "Cebu", "Davao", "Baguio", "Pampanga", "Laguna", "Marikina", "Quezon", "Rizal", "Olongapo", "La Union", "Tarlac", "Tagaytay", "Koronadal", "General Santos", "Makati", "Taguig", "Mandaluyong", "Cavite", "Batangas", "Iloilo", "Bacolod"];

function toLocalDateTimeValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function parseScheduleSource(source: string): ExtractedSchedule[] {
  const cleaned = source.replace(/\r/g, "\n").replace(/[•●▪◦]/g, "\n").replace(/\n{2,}/g, "\n");
  const headingRecords: ExtractedSchedule[] = [];
  let headingMonth: number | null = null;
  let headingYear = new Date().getFullYear();
  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine.trim();
    const heading = line.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?$/i);
    if (heading) {
      headingMonth = scheduleMonths[heading[1].toLowerCase()];
      headingYear = Number(heading[2]) || headingYear;
      continue;
    }
    if (headingMonth === null) continue;
    const entry = line.match(/^(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?\s*[–—-]\s*(.+)$/);
    if (!entry) continue;
    const startDay = Number(entry[1]);
    const endDay = entry[2] ? Number(entry[2]) : null;
    const location = entry[3].replace(/🇵🇭|🇬🇧|🇸🇬|✅|\([^)]*updated[^)]*\)/gi, "").trim();
    const countryCode = /🇬🇧|\bUK\b|United Kingdom/i.test(line) ? "GB" : /🇸🇬|Singapore/i.test(line) ? "SG" : "PH";
    const timezone = countryCode === "GB" ? "Europe/London" : countryCode === "SG" ? "Asia/Singapore" : "Asia/Manila";
    const start = `${headingYear}-${String(headingMonth + 1).padStart(2, "0")}-${String(startDay).padStart(2, "0")}T09:00`;
    const end = endDay ? `${headingYear}-${String(headingMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}T17:00` : null;
    headingRecords.push({ event_at: start, ends_at: end, venue: location === "UK" ? "United Kingdom" : location, city: location === "UK" ? "United Kingdom" : location, capacity: 0, status: "scheduled", timezone, country_code: countryCode });
  }
  if (headingRecords.length) return headingRecords;

  const monthPattern = /(?:(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*,?\s*)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/gi;
  const matches = [...cleaned.matchAll(monthPattern)];
  if (!matches.length) return [];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? cleaned.length;
    const segment = cleaned.slice(start, end).trim();
    const month = scheduleMonths[match[1].toLowerCase()];
    const day = Number(match[2]);
    const year = Number(match[3]) || new Date().getFullYear();
    const time = segment.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    let hour = time ? Number(time[1]) : 9;
    const minute = time?.[2] ? Number(time[2]) : 0;
    if (time?.[3]?.toLowerCase() === "pm" && hour < 12) hour += 12;
    if (time?.[3]?.toLowerCase() === "am" && hour === 12) hour = 0;

    const explicitVenue = segment.match(/(?:venue|location|where)\s*[:—-]\s*([^\n]+)/i)?.[1]?.trim();
    const residual = segment
      .replace(match[0], " ")
      .replace(time?.[0] ?? "", " ")
      .replace(/\b(?:venue|location|where|date|time)\s*[:—-]?/gi, " ")
      .replace(/\b(?:at|on)\b/gi, " ")
      .replace(/\b\d+\s*(?:seats?|pax|participants?)\b/gi, " ")
      .split(/\n|\s+[|—–-]\s+/)
      .map((part) => part.replace(/^[,:;\s]+|[,:;\s]+$/g, "").trim())
      .filter((part) => part.length > 2 && !/^(am|pm)$/i.test(part));
    const venue = explicitVenue || residual[0] || "Venue to be confirmed";
    const city = philippineCities.find((place) => `${segment} ${venue}`.toLowerCase().includes(place.toLowerCase())) || "";
    const capacity = Number(segment.match(/\b(\d+)\s*(?:seats?|pax|participants?)\b/i)?.[1] ?? 0);
    const countryCode = /🇬🇧|\bUK\b|United Kingdom/i.test(segment) ? "GB" : /🇸🇬|Singapore/i.test(segment) ? "SG" : "PH";
    return {
      event_at: toLocalDateTimeValue(new Date(year, month, day, hour, minute)),
      ends_at: null,
      venue,
      city,
      capacity,
      status: "scheduled",
      timezone: countryCode === "GB" ? "Europe/London" : countryCode === "SG" ? "Asia/Singapore" : "Asia/Manila",
      country_code: countryCode,
    };
  });
}

function ScheduleExtractor({ onClose, onImport }: { onClose: () => void; onImport: (records: ExtractedSchedule[]) => Promise<void> }) {
  const [source, setSource] = useState("");
  const [records, setRecords] = useState<ExtractedSchedule[]>([]);
  const [readingImage, setReadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function extract(text = source) {
    const parsed = parseScheduleSource(text);
    setRecords(parsed);
    setError(parsed.length ? "" : "No dates were found. Include a month, day, venue, and optional time on each schedule.");
  }

  async function readImage(file?: File) {
    if (!file) return;
    setReadingImage(true);
    setError("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const text = result.data.text.trim();
      setSource(text);
      extract(text);
    } catch {
      setError("The image could not be read. Try a clearer image or paste the schedule text below.");
    } finally {
      setReadingImage(false);
    }
  }

  function updateRecord(index: number, patch: Partial<ExtractedSchedule>) {
    setRecords((current) => current.map((record, recordIndex) => recordIndex === index ? { ...record, ...patch } : record));
  }

  return (
    <div className="platform-modal-backdrop schedule-extractor-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="schedule-extractor" role="dialog" aria-modal="true" aria-labelledby="schedule-extractor-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span className="admin-eyebrow">Smart schedule entry</span><h2 id="schedule-extractor-title">Extract dates automatically.</h2><p>Upload a schedule image or paste a paragraph. Review the result before publishing.</p></div><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
        <div className="schedule-extractor-inputs">
          <label className="schedule-image-drop"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void readImage(event.target.files?.[0])} /><span>{readingImage ? "Reading image…" : "Upload schedule image"}</span><small>PNG, JPG, or WEBP · processed privately in your browser</small></label>
          <div className="schedule-extractor-divider"><span>or paste text</span></div>
          <label>Schedule paragraph<textarea value={source} onChange={(event) => setSource(event.target.value)} placeholder={"August 15, 2026 at 9:00 AM — House of Transformation, Pasig\nSeptember 19, 2026 at 9:00 AM — Cebu City · 120 seats"} /></label>
          <button className="platform-primary" type="button" disabled={!source.trim() || readingImage} onClick={() => extract()}>Extract schedules</button>
        </div>
        {error && <div className="platform-inline-error" role="alert">{error}</div>}
        {records.length > 0 && <div className="schedule-extractor-results"><header><div><span className="admin-eyebrow">Ready to review</span><h3>{records.length} schedule{records.length === 1 ? "" : "s"} found</h3></div><span>Edit anything before publishing</span></header>{records.map((record, index) => <article key={`${record.event_at}-${index}`}><span className="schedule-result-number">{String(index + 1).padStart(2, "0")}</span><label>Starts<input type="datetime-local" value={record.event_at} onChange={(event) => updateRecord(index, { event_at: event.target.value })} /></label><label>Ends<input type="datetime-local" value={record.ends_at ?? ""} onChange={(event) => updateRecord(index, { ends_at: event.target.value || null })} /></label><label>Venue<input value={record.venue} onChange={(event) => updateRecord(index, { venue: event.target.value, city: event.target.value })} /></label><label>Country<select value={record.country_code} onChange={(event) => { const country_code = event.target.value; updateRecord(index, { country_code, timezone: country_code === "GB" ? "Europe/London" : country_code === "SG" ? "Asia/Singapore" : "Asia/Manila" }); }}><option value="PH">🇵🇭 PH</option><option value="GB">🇬🇧 UK</option><option value="SG">🇸🇬 SG</option></select></label><button type="button" aria-label={`Remove schedule ${index + 1}`} onClick={() => setRecords((current) => current.filter((_, recordIndex) => recordIndex !== index))}>×</button></article>)}</div>}
        <footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" type="button" disabled={!records.length || saving} onClick={() => { setSaving(true); setError(""); void onImport(records).catch(() => setError("One or more schedules could not be published. Check for duplicate dates and venues.")).finally(() => setSaving(false)); }}>{saving ? "Publishing…" : `Publish ${records.length || ""} schedule${records.length === 1 ? "" : "s"}`}</button></footer>
      </section>
    </div>
  );
}

function SystemInformation() {
  return (
    <PlatformShell page="system-information">
      <div className="platform-centered-page">
        <article className="system-card">
          <header><div><span>▤</span><h1>Hybrid</h1></div><b>⌁ Active</b></header>
          <div className="system-grid"><section><small>⬡ VERSION</small><strong>2.4.3</strong></section><section><small>♙ OWNER</small><strong>Awakening PH</strong></section></div>
          <section className="system-suites"><small>⬡ ACTIVE SUITES</small><div><span>Core</span><span>Operations</span><span>Finance</span><span>Document</span></div></section>
        </article>
      </div>
    </PlatformShell>
  );
}

function AccountSettings() {
  const [name, setName] = useState("Awakening Operations");
  const [saved, setSaved] = useState(false);
  return (
    <PlatformShell page="account">
      <section className="account-workspace">
        <header className="account-hero">
          <div><span className="admin-eyebrow">Secure administration</span><h1>Account<br /><em>settings.</em></h1><p>Manage the identity used inside the Awakening control room.</p></div>
          <span className="account-security-mark" aria-hidden="true">AN</span>
        </header>
        <div className="account-layout">
          <aside className="account-profile-card">
            <span className="account-profile-avatar">AN</span>
            <div><small>Signed in as</small><strong>{name}</strong><p>Administrator · Awakening Philippines</p></div>
            <span className="account-online"><i />Awakening Server Online</span>
          </aside>
          <article className="account-settings-card">
            <header><div><span className="admin-eyebrow">Profile details</span><h2>Your admin identity</h2></div><span>Protected account</span></header>
            <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>Account email<input value="soulscalesystems@gmail.com" readOnly aria-readonly="true" /></label>
            <div className="account-security-row"><div><small>Password</small><strong>••••••••••••</strong></div><span>Managed securely</span></div>
            <footer><p>{saved ? "Your account display name is updated." : "Changes affect how your name appears in this control room."}</p><button className="platform-primary" type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200); }}>{saved ? "Changes saved" : "Save changes"}</button></footer>
          </article>
        </div>
      </section>
    </PlatformShell>
  );
}

function DocumentModal({ onClose, onSave }: { onClose: () => void; onSave: (payload: StoredRecord) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}><form className="platform-modal ops-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const file = data.get("file"); setSaving(true); void onSave({ name: String(data.get("name") || (file instanceof File ? file.name : "Untitled file")), category: String(data.get("category")), file_url: String(data.get("file_url")), notes: String(data.get("notes")) }).finally(() => setSaving(false)); }}><header><div><span className="admin-eyebrow">Document hub</span><h2>Add a new file</h2></div><button type="button" onClick={onClose} aria-label="Close">×</button></header><p>Keep the title, category, and source together so the team can find it quickly.</p><label>Document title<input name="name" placeholder="2026 Facilitator Guide" /></label><label>Choose a file<input name="file" type="file" /></label><div className="ops-modal-grid"><label>Category<select name="category"><option>Operations</option><option>Facilitator resources</option><option>Finance</option><option>Marketing</option></select></label><label>Source link<input name="file_url" type="url" placeholder="https://…" /></label></div><label>Notes<textarea name="notes" placeholder="What should the team know about this file?" /></label><footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Add to hub"}</button></footer></form></div>;
}

function ResourcePage({ page }: { page: "contacts" | "document-hub" }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const config = page === "contacts" ? ["Contact Library", "Partners, suppliers, and community contacts in one clean workspace.", "New Contact"] : ["Document Hub", "A focused home for operational files, links, and team resources.", "Add New File"];
  const resource = page === "contacts" ? "contacts" : "documents";
  const { records, connection, createRecord, deleteRecord } = usePlatformRecords(resource);
  const filtered = records.filter((record) => String(record.name ?? "").toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page={page}>
      <section className="ops-data-page">
        <header className="ops-data-hero"><div><span className="admin-eyebrow">Awakening knowledge base</span><h1>{config[0]}</h1><p>{config[1]}</p></div><DataConnectionBadge state={connection} /></header>
        {page === "document-hub" && <QuickLinks items={[{ label: "Contacts", href: "/platform/contacts" }, { label: "Schedule manager", href: "/platform/seminar-schedule-management" }]} />}
        <DataConnectionBadge state={connection} />
        <PageIntro title={config[0]} copy={config[1]} action={config[2]} search={query} onSearch={setQuery} onAction={() => setModal(true)} />
        {saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}
        {filtered.length ? <div className="ops-card-grid">{filtered.map((record) => <article key={record.id ?? String(record.name)}><span className="ops-card-icon">{page === "contacts" ? "◉" : "▤"}</span><div><b>{String(record.name ?? "Untitled")}</b><small>{page === "contacts" ? String(record.email ?? record.phone ?? "Contact") : String(record.category ?? "Document")}</small>{page === "document-hub" && record.notes && <p>{String(record.notes)}</p>}</div>{page === "document-hub" && record.file_url ? <a href={String(record.file_url)} target="_blank" rel="noreferrer">Open ↗</a> : null}<button type="button" aria-label={`Delete ${String(record.name ?? "record")}`} onClick={() => void deleteRecord(record.id)}>×</button></article>)}</div> : <EmptyState message={page === "contacts" ? "No contacts match your search." : "No documents yet. Add your first operational file."} />}
      </section>
      {modal && (page === "contacts" ? <Modal title={config[2]} onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void createRecord({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")) }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Awakening Server could not save this record.")); }} /> : <DocumentModal onClose={() => setModal(false)} onSave={async (payload) => { await createRecord(payload); setModal(false); setSaveError(""); }} />)}
      <button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label={config[2]}>＋</button>
    </PlatformShell>
  );
}

function LineChart({ color = "#3b82f6", fill = false }: { color?: string; fill?: boolean }) {
  return <div className={`platform-line-chart ${fill ? "with-fill" : ""}`}><span /><span /><span /><span /><i style={{ borderColor: color }} /><b style={{ color }}>●</b></div>;
}

function SalesRevenue() {
  const { records, connection } = usePlatformRecords("registrations");
  const activeRecords = records.filter((record) => !isArchivedRegistration(record));
  const paid = activeRecords.filter((record) => String(record.status).toLowerCase() === "paid");
  const paidRevenue = paid.reduce((sum, record) => sum + (Number(record.total_amount) || 0), 0);
  const tickets = activeRecords.reduce((sum, record) => sum + (Number(record.quantity) || 1), 0);
  const month = new Date().getMonth();
  const monthRecords = activeRecords.filter((record) => record.created_at && new Date(record.created_at).getMonth() === month);
  const paymentGroups = ["gcash", "bank"].map((method) => ({ method, count: activeRecords.filter((record) => record.payment_method === method).length }));
  const locationTotals = Array.from(activeRecords.reduce((map, record) => { const place = String(record.event_date ?? "Date pending").split("·").at(-1)?.trim() || "Date pending"; map.set(place, (map.get(place) ?? 0) + (Number(record.total_amount) || 0)); return map; }, new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <PlatformShell page="sales-revenue">
      <section className="ops-data-page">
        <header className="ops-data-hero"><div><span className="admin-eyebrow">Live registration intelligence</span><h1>Profit &amp; Sales Manager</h1><p>Real figures calculated directly from the registration center.</p></div><DataConnectionBadge state={connection} /></header>
        <div className="platform-metrics four"><MetricCard label="Tickets reserved" value={tickets.toLocaleString("en-PH")} /><MetricCard label="Registrations this month" value={String(monthRecords.length)} /><MetricCard label="Confirmed revenue" value={`₱${paidRevenue.toLocaleString("en-PH")}`} /><MetricCard label="Payments confirmed" value={String(paid.length)} /></div>
        <div className="ops-insight-grid"><article><header><span>Payment mix</span><strong>{activeRecords.length} active registrations</strong></header>{paymentGroups.map((group) => <div className="ops-stat-row" key={group.method}><span>{group.method === "gcash" ? "GCash" : "Bank transfer"}</span><div><i style={{ width: `${activeRecords.length ? (group.count / activeRecords.length) * 100 : 0}%` }} /></div><b>{group.count}</b></div>)}</article><article><header><span>Bookings by schedule</span><strong>Submitted value</strong></header>{locationTotals.length ? locationTotals.map(([location, amount]) => <div className="ops-location-row" key={location}><span>{location}</span><b>₱{amount.toLocaleString("en-PH")}</b></div>) : <EmptyState message="Registration data will appear here." />}</article></div>
      </section>
    </PlatformShell>
  );
}

function LeadModal({ onClose, onSave }: { onClose: () => void; onSave: (payload: StoredRecord) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}><form className="platform-modal ops-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setSaving(true); void onSave({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")), organization: String(data.get("organization")), source: String(data.get("source")), stage: String(data.get("stage")), value: Number(data.get("value")) || 0 }).finally(() => setSaving(false)); }}><header><div><span className="admin-eyebrow">New relationship</span><h2>Add a lead</h2></div><button type="button" onClick={onClose} aria-label="Close">×</button></header><div className="ops-modal-grid"><label>Full name<input name="name" required /></label><label>Organization<input name="organization" /></label><label>Email<input name="email" type="email" /></label><label>Contact number<input name="phone" /></label><label>Lead source<select name="source"><option>Direct</option><option>Facebook</option><option>Referral</option><option>Event</option></select></label><label>Stage<select name="stage"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="won">Won</option></select></label></div><label>Potential value<input name="value" type="number" min="0" placeholder="0" /></label><footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" disabled={saving}>{saving ? "Saving…" : "Add lead"}</button></footer></form></div>;
}

function CRM() {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [stage, setStage] = useState("all");
  const { records: leads, connection, createRecord, updateRecord } = usePlatformRecords("leads");
  const visibleLeads = leads.filter((lead) => `${lead.name ?? ""} ${lead.organization ?? ""} ${lead.email ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (stage === "all" || String(lead.stage ?? "new") === stage));
  const pipeline = leads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
  return (
    <PlatformShell page="crm">
      <section className="ops-data-page">
        <header className="ops-data-hero"><div><span className="admin-eyebrow">Relationship pipeline</span><h1>Customer Relationship Manager</h1><p>Track each conversation from first contact to a committed partnership.</p></div><DataConnectionBadge state={connection} /></header>
        <div className="platform-metrics four"><MetricCard label="Total leads" value={String(leads.length)} /><MetricCard label="New conversations" value={String(leads.filter((lead) => !lead.stage || lead.stage === "new").length)} /><MetricCard label="Qualified" value={String(leads.filter((lead) => lead.stage === "qualified").length)} /><MetricCard label="Pipeline value" value={`₱${pipeline.toLocaleString("en-PH")}`} /></div>
        <section className="ops-table-panel"><header><div><h2>Relationship pipeline</h2><p>Every record matches the information collected in the lead form.</p></div><div><SearchBar value={query} onChange={setQuery} /><select value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">All stages</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="won">Won</option></select><button className="platform-primary" onClick={() => setModal(true)}>＋ New lead</button></div></header>{saveError && <div className="platform-inline-error">{saveError}</div>}<div className="ops-lead-list">{visibleLeads.length ? visibleLeads.map((lead) => <article key={String(lead.id ?? lead.name)}><div><strong>{String(lead.name ?? "Untitled lead")}</strong><small>{String(lead.organization ?? lead.email ?? "Independent")}</small></div><span>{String(lead.source ?? "Direct")}</span><b>₱{(Number(lead.value) || 0).toLocaleString("en-PH")}</b><select value={String(lead.stage ?? "new")} onChange={(event) => void updateRecord(lead.id, { stage: event.target.value })}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="won">Won</option></select></article>) : <EmptyState message="No leads match these filters." />}</div></section>
        <QuickLinks items={[{ label: "Registration center", href: "/platform" }, { label: "Profit & Sales", href: "/platform/sales-revenue" }, { label: "Schedule manager", href: "/platform/seminar-schedule-management" }]} />
      </section>
      {modal && <LeadModal onClose={() => setModal(false)} onSave={async (payload) => { await createRecord(payload); setModal(false); setSaveError(""); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label="New Lead">＋</button>
    </PlatformShell>
  );
}

function RegistrationReviewModal({ record, dates, onClose, onSave }: { record: StoredRecord; dates: string[]; onClose: () => void; onSave: (payload: StoredRecord) => Promise<void> }) {
  const [attendanceDate, setAttendanceDate] = useState(String(record.event_date ?? ""));
  const [paymentMethod, setPaymentMethod] = useState(String(record.payment_method ?? ""));
  const [status, setStatus] = useState(String(record.status ?? "for_confirmation").toLowerCase().replaceAll(" ", "_"));
  const [saving, setSaving] = useState(false);
  const save = (nextStatus = status) => { setSaving(true); void onSave({ event_date: attendanceDate, payment_method: paymentMethod, status: nextStatus }).finally(() => setSaving(false)); };
  const proof = (() => { try { const parsed = JSON.parse(String(record.payment_proof_name ?? "")) as { name?: string; data?: string }; return parsed.data?.startsWith("data:image/") ? parsed : null; } catch { return null; } })();
  return <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="platform-modal ops-modal registration-review-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="admin-eyebrow">Registration review</span><h2>{String(record.name ?? "Registrant")}</h2><p>{String(record.code ?? "NEW")} · {Number(record.quantity) || 1} ticket{Number(record.quantity) === 1 ? "" : "s"}</p></div><button type="button" onClick={onClose} aria-label="Close">×</button></header><div className="registration-review-facts"><div><span>Email</span><strong>{String(record.email ?? "—")}</strong></div><div><span>Reference</span><strong>{String(record.payment_reference ?? "Not provided")}</strong></div><div><span>Amount</span><strong>₱{(Number(record.total_amount) || 0).toLocaleString("en-PH")}</strong></div></div>{proof?.data ? <a className="registration-proof-link" href={proof.data} target="_blank" rel="noreferrer">View payment proof · {proof.name || "Image"} ↗</a> : <p className="registration-proof-legacy">Payment proof on older records is stored as: {String(record.payment_proof_name ?? "Not provided")}</p>}<label>Attendance date <small>Per request only</small><select value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)}>{!dates.includes(attendanceDate) && <option value={attendanceDate}>{attendanceDate}</option>}{dates.map((date) => <option value={date} key={date}>{date}</option>)}</select></label><div className="ops-modal-grid"><label>Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="">Not selected</option><option value="gcash">GCash</option><option value="bank">Bank transfer</option></select></label><label>Payment status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="for_confirmation">For confirmation</option><option value="paid">Paid</option><option value="rejected">Rejected</option></select></label></div><footer className="registration-review-actions"><button type="button" className="danger" disabled={saving} onClick={() => save("rejected")}>Reject payment</button><button type="button" disabled={saving} onClick={() => save()}>Save changes</button><button type="button" className="platform-primary" disabled={saving} onClick={() => save("paid")}>Confirm payment</button></footer></section></div>;
}

function isArchivedRegistration(record: StoredRecord) {
  return String(record.status ?? "").toLowerCase().startsWith("archived_");
}

function archiveRegistrationStatus(record: StoredRecord) {
  const current = String(record.status ?? "for_confirmation").toLowerCase().replaceAll(" ", "_");
  return `archived_${current.replace(/^archived_/, "")}`;
}

function restoreRegistrationStatus(record: StoredRecord) {
  return String(record.status ?? "archived_for_confirmation").toLowerCase().replace(/^archived_/, "") || "for_confirmation";
}

function RegistrationCenter() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [archiveView, setArchiveView] = useState(false);
  const [reviewing, setReviewing] = useState<StoredRecord | null>(null);
  const [saveError, setSaveError] = useState("");
  const seededRegistrants = registrants.map((record) => ({ ...record, event_date: record.date, status: record.status === "Paid" ? "paid" : "for_confirmation" }));
  const { records, connection, updateRecord } = usePlatformRecords("registrations", seededRegistrants);
  const activeRecords = records.filter((record) => !isArchivedRegistration(record));
  const archivedRecords = records.filter(isArchivedRegistration);
  const viewRecords = archiveView ? archivedRecords : activeRecords;
  const dates = Array.from(new Set(activeRecords.map((record) => String(record.event_date ?? "")).filter(Boolean))).sort();
  const filtered = viewRecords.filter((record) => `${record.name ?? ""} ${record.email ?? ""} ${record.code ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (archiveView || statusFilter === "all" || String(record.status ?? "for_confirmation").toLowerCase().replaceAll(" ", "_") === statusFilter) && (dateFilter === "all" || String(record.event_date) === dateFilter));
  const tickets = activeRecords.reduce((sum, record) => sum + (Number(record.quantity) || 1), 0);
  const revenue = activeRecords.reduce((sum, record) => sum + (Number(record.total_amount) || 0), 0);
  const pending = activeRecords.filter((record) => record.status === "for_confirmation" || record.status === "For Confirmation").length;

  function exportRegistrations() {
    const header = ["Code", "Name", "Email", "Phone", "Schedule", "Quantity", "Amount", "Payment Method", "Payment Reference", "Status"];
    const rows = filtered.map((record) => [record.code, record.name, record.email, record.phone, record.event_date, record.quantity, record.total_amount, record.payment_method, record.payment_reference, record.status]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `awakening-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <PlatformShell page="registration-center">
      <section className="admin-control-room">
        <header className="admin-control-hero">
          <div><span className="admin-eyebrow">Awakening operations · Live control room</span><h1>Registration<br /><em>dashboard.</em></h1><p>Everything arriving from Secure My Slot, organized in one calm command center.</p></div>
          <div className="admin-control-actions"><DataConnectionBadge state={connection} /><Link href="/platform/seminar-schedule-management" className="platform-primary">Manage schedules ↗</Link></div>
        </header>

        <div className="admin-live-strip"><span><i />Awakening Server Online</span><p>{pending ? `${pending} payment${pending === 1 ? "" : "s"} waiting for confirmation` : "All payments reviewed"}</p><time>Live updates every 3 seconds</time></div>

        <div className="admin-metric-grid">
          <article><span>Active registrations</span><strong>{activeRecords.length}</strong><small>Archived records excluded</small></article>
          <article><span>Tickets reserved</span><strong>{tickets}</strong><small>Across all schedules</small></article>
          <article><span>Gross bookings</span><strong>₱{revenue.toLocaleString("en-PH")}</strong><small>Submitted registration value</small></article>
          <article className={pending ? "needs-attention" : ""}><span>For confirmation</span><strong>{pending}</strong><small>{pending ? "Needs your attention" : "Nothing pending"}</small></article>
        </div>

        <section className="admin-registration-panel">
          <header><div><span className="admin-eyebrow">Attendee database</span><h2>Registrations</h2><p>Filter attendees, review payments, or move an attendance date when requested.</p></div><div><SearchBar value={query} onChange={setQuery} placeholder="Search name, email, or code" /><button type="button" onClick={exportRegistrations}>Export CSV</button></div></header>
          <div className="admin-registration-views" role="tablist" aria-label="Registration views"><button type="button" role="tab" aria-selected={!archiveView} className={!archiveView ? "is-active" : ""} onClick={() => setArchiveView(false)}>Active <span>{activeRecords.length}</span></button><button type="button" role="tab" aria-selected={archiveView} className={archiveView ? "is-active" : ""} onClick={() => setArchiveView(true)}>Archive <span>{archivedRecords.length}</span></button></div>
          <div className="admin-registration-filters"><label>Status<select value={statusFilter} disabled={archiveView} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="for_confirmation">For confirmation</option><option value="paid">Paid</option><option value="rejected">Rejected</option></select></label><label>Attendance date<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="all">All dates</option>{dates.map((date) => <option value={date} key={date}>{date}</option>)}</select></label><button type="button" onClick={() => { setQuery(""); setStatusFilter("all"); setDateFilter("all"); }}>Reset filters</button><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
          {saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}
          <div className="admin-registration-table">
            <div className="admin-table-head"><span>Attendee</span><span>Schedule</span><span>Booking</span><span>Status</span><span>Action</span></div>
            {filtered.length ? filtered.map((record) => {
              const archived = isArchivedRegistration(record);
              const paid = record.status === "paid" || record.status === "Paid";
              const rejected = record.status === "rejected" || record.status === "Rejected";
              return (
                <article key={String(record.id ?? record.code)}>
                  <div className="admin-attendee"><b>{String(record.name ?? "Registrant").slice(0, 1)}</b><span><strong>{String(record.name ?? "Registrant")}</strong><a href={`mailto:${String(record.email ?? "")}`}>{String(record.email ?? "—")}</a><small>{String(record.code ?? "NEW")}</small></span></div>
                  <div><strong>{String(record.event_date ?? "Date pending")}</strong><small>{String(record.phone ?? "—")}</small></div>
                  <div className="admin-booking-cell"><strong>{Number(record.quantity) || 1} ticket{Number(record.quantity) === 1 ? "" : "s"}</strong><small>₱{(Number(record.total_amount) || 0).toLocaleString("en-PH")} · {record.payment_method === "gcash" ? "GCash" : record.payment_method === "bank" ? "Bank" : "Method pending"}</small></div>
                  <span className={`admin-status ${archived ? "archived" : paid ? "paid" : rejected ? "rejected" : "pending"}`}><i />{archived ? "Archived" : paid ? "Paid" : rejected ? "Rejected" : "For confirmation"}</span>
                  <div className="admin-row-actions">{!archived && <button type="button" disabled={!record.id} onClick={() => setReviewing(record)}>Review</button>}<button type="button" disabled={!record.id} onClick={() => void updateRecord(record.id, { status: archived ? restoreRegistrationStatus(record) : archiveRegistrationStatus(record) }).then(() => setSaveError("")).catch(() => setSaveError(archived ? "This registration could not be restored." : "This registration could not be archived."))}>{archived ? "Restore" : "Archive"}</button></div>
                </article>
              );
            }) : <EmptyState message="No registrations match your search." />}
          </div>
        </section>
      </section>
      {reviewing && <RegistrationReviewModal record={reviewing} dates={dates} onClose={() => setReviewing(null)} onSave={async (payload) => { await updateRecord(reviewing.id, payload); setReviewing(null); setSaveError(""); }} />}
    </PlatformShell>
  );
}

function ScheduleManagement() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StoredRecord | null | undefined>(undefined);
  const [extractorOpen, setExtractorOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const seededSchedules: StoredRecord[] = schedules.map((item) => ({ ...item }));
  const { records: items, connection, createRecord, updateRecord } = usePlatformRecords("schedules", seededSchedules);
  const visible = items.filter((item) => `${item.event_at ?? ""} ${item.venue ?? ""} ${item.city ?? ""}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => new Date(String(a.event_at)).getTime() - new Date(String(b.event_at)).getTime());
  return (
    <PlatformShell page="seminar-schedule-management">
      <section className="admin-schedule-workspace">
        <header className="admin-schedule-hero"><div><span className="admin-eyebrow">One source of truth</span><h1>Schedule<br /><em>manager.</em></h1><p>Create or adjust a session once. The public schedule and registration selector update automatically.</p></div><div><DataConnectionBadge state={connection} /><button className="platform-secondary-dark" type="button" onClick={() => setExtractorOpen(true)}>✦ Extract dates</button><button className="platform-primary" type="button" onClick={() => setEditing(null)}>＋ New schedule</button></div></header>
        <div className="admin-publish-flow"><span>Admin schedule</span><i>→</i><span>Latest Schedules</span><i>→</i><span>Secure My Slot</span></div>
        <section className="admin-schedule-panel">
          <header><div><span className="admin-eyebrow">Published sessions</span><h2>Upcoming schedule</h2></div><SearchBar value={query} onChange={setQuery} placeholder="Search date, city, or venue" /></header>
          {saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}
          <div className="admin-schedule-list">{visible.map((item, index) => {
            const published = item.status === "scheduled";
            return <article key={String(item.id ?? `${item.event_at}-${index}`)}><time><b>{formatRecordPart(item, { day: "2-digit" }) || "—"}</b><span>{formatRecordPart(item, { month: "short", year: "numeric" }) || "Date pending"}</span></time><div><span className={`admin-status ${published ? "paid" : "pending"}`}><i />{published ? "Published" : String(item.status ?? "Draft")}</span><h3>{scheduleFlag(item.country_code)} {String(item.city || "Awakening session")}</h3><p>{String(item.venue ?? "Venue pending")}</p><small>{item.event_at ? formatScheduleRange(asPublicSchedule(item)) : ""}{item.capacity ? ` · ${item.capacity} seats` : ""}</small></div><div><button type="button" onClick={() => setEditing(item)}>Edit</button><button type="button" disabled={!item.id} onClick={() => void updateRecord(item.id, { status: published ? "draft" : "scheduled" }).then(() => setSaveError("")).catch(() => setSaveError("The publishing status could not be changed."))}>{published ? "Unpublish" : "Publish"}</button></div></article>;
          })}</div>
        </section>
      </section>
      {editing !== undefined && <ScheduleModal record={editing ?? undefined} onClose={() => setEditing(undefined)} onSave={async (payload) => { if (editing?.id) await updateRecord(editing.id, payload); else await createRecord(payload); setEditing(undefined); setSaveError(""); }} />}
      {extractorOpen && <ScheduleExtractor onClose={() => setExtractorOpen(false)} onImport={async (extracted) => { for (const item of extracted) await createRecord({ ...item, event_at: zonedDateTimeToIso(item.event_at, item.timezone) ?? undefined, ends_at: item.ends_at ? zonedDateTimeToIso(item.ends_at, item.timezone) : null }); setExtractorOpen(false); setSaveError(""); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setEditing(null)} aria-label="New Schedule">＋</button>
    </PlatformShell>
  );
}

function PlatformSchedules() {
  const seededSchedules: StoredRecord[] = schedules.map((item) => ({ ...item }));
  const { records, connection } = usePlatformRecords("schedules", seededSchedules);
  const published = records.filter((item) => item.status === "scheduled").sort((a, b) => new Date(String(a.event_at)).getTime() - new Date(String(b.event_at)).getTime());
  return <PlatformShell page="latest-schedules"><section className="ops-data-page"><header className="ops-data-hero"><div><span className="admin-eyebrow">Public schedule preview</span><h1>Latest Schedules</h1><p>This is the same live schedule shown to visitors and inside Secure My Slot.</p></div><DataConnectionBadge state={connection} /></header><div className="ops-schedule-grid">{published.map((item, index) => <article key={String(item.id ?? index)}><time><b>{formatRecordPart(item, { day: "2-digit" }) || "—"}</b><span>{formatRecordPart(item, { month: "short", year: "numeric" }) || "Pending"}</span></time><div><span>{scheduleFlag(item.country_code)} {String(item.city ?? "Awakening Philippines")}</span><h2>{String(item.venue ?? "Venue pending")}</h2><p>{item.event_at ? formatScheduleRange(asPublicSchedule(item)) : "Time pending"}</p></div><Link href="/platform/seminar-schedule-management">Edit ↗</Link></article>)}</div></section></PlatformShell>;
}

function ApplicationModal({ page, onClose, onSave }: { page: "applications-organizations" | "applications-staffing" | "applications-sponsorship"; onClose: () => void; onSave: (payload: StoredRecord) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const organization = page === "applications-organizations";
  const staffing = page === "applications-staffing";
  return <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}><form className="platform-modal ops-modal application-record-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, key === "employee_count" ? Number(value) || 0 : String(value)])); setSaving(true); void onSave(payload).finally(() => setSaving(false)); }}><header><div><span className="admin-eyebrow">{organization ? "Organization inquiry" : staffing ? "Team application" : "Sponsorship inquiry"}</span><h2>Add a record</h2></div><button type="button" onClick={onClose} aria-label="Close">×</button></header><div className="ops-modal-grid"><label>{organization ? "Owner / CEO name" : "Full name"}<input name="name" required /></label><label>Email address<input name="email" type="email" required /></label><label>Contact number<input name="phone" /></label>{staffing ? <label>Facebook profile<input name="facebook_url" type="url" placeholder="https://facebook.com/…" /></label> : <><label>Business name<input name="business_name" required /></label><label>Industry<input name="industry" /></label><label>How they found Awakening<input name="discovery_source" /></label></>}</div>{organization && <label>Number of employees<input name="employee_count" type="number" min="1" /></label>}{page === "applications-sponsorship" && <label>Products or services<textarea name="products" /></label>}{!organization && <label>Status<select name="status"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></label>}<footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" disabled={saving}>{saving ? "Saving…" : "Save record"}</button></footer></form></div>;
}

function ApplicationsPage({ page }: { page: "applications-organizations" | "applications-staffing" | "applications-sponsorship" }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const data = {
    "applications-organizations": ["Organization Inquiries", "Business owners who want to bring the Awakening experience into their organization.", "New inquiry"],
    "applications-staffing": ["Staffing Team Applicants", "People interested in helping create the Awakening experience.", "Add applicant"],
    "applications-sponsorship": ["Sponsorship Applications", "Brands and partners exploring a meaningful collaboration.", "New inquiry"],
  }[page] as [string, string, string];
  const resource = { "applications-organizations": "organization-applications", "applications-staffing": "staffing-applications", "applications-sponsorship": "sponsorship-applications" }[page];
  const { records, connection, createRecord } = usePlatformRecords(resource);
  const visible = records.filter((record) => `${record.name ?? ""} ${record.email ?? ""} ${record.business_name ?? ""} ${record.industry ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page={page}><section className="ops-data-page"><header className="ops-data-hero rainbow"><div><span className="admin-eyebrow">Awakening applications</span><h1>{data[0]}</h1><p>{data[1]}</p></div><DataConnectionBadge state={connection} /></header><section className="ops-table-panel"><header><div><h2>{data[0]}</h2><p>{visible.length} record{visible.length === 1 ? "" : "s"} in this workspace.</p></div><div><SearchBar value={query} onChange={setQuery} /><button className="platform-primary" onClick={() => setModal(true)}>＋ {data[2]}</button></div></header>{saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}<div className="application-card-grid">{visible.length ? visible.map((record) => <article key={String(record.id ?? record.name)}><header><span>{String(record.name ?? "A").slice(0, 1)}</span><div><h3>{String(record.name ?? "Applicant")}</h3><p>{String(record.business_name ?? record.email ?? "Application")}</p></div><b>{String(record.status ?? "new")}</b></header><dl><div><dt>Email</dt><dd>{String(record.email ?? "—")}</dd></div><div><dt>Contact</dt><dd>{String(record.phone ?? "—")}</dd></div>{record.industry && <div><dt>Industry</dt><dd>{String(record.industry)}</dd></div>}{record.employee_count ? <div><dt>Team size</dt><dd>{String(record.employee_count)}</dd></div> : null}{record.facebook_url && <div><dt>Facebook</dt><dd><a href={String(record.facebook_url)} target="_blank" rel="noreferrer">View profile ↗</a></dd></div>}{record.products && <div><dt>Offering</dt><dd>{String(record.products)}</dd></div>}</dl></article>) : <EmptyState message="No applications match your search." />}</div></section></section>{modal && <ApplicationModal page={page} onClose={() => setModal(false)} onSave={async (payload) => { await createRecord(payload); setModal(false); setSaveError(""); }} />}<button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label={data[2]}>＋</button></PlatformShell>
  );
}

export function PlatformApp({ page }: { page: PlatformPage }) {
  if (page === "system-information") return <SystemInformation />;
  if (page === "account") return <AccountSettings />;
  if (page === "contacts" || page === "document-hub") return <ResourcePage page={page} />;
  if (page === "sales-revenue") return <SalesRevenue />;
  if (page === "crm") return <CRM />;
  if (page === "registration-center") return <RegistrationCenter />;
  if (page === "seminar-schedule-management") return <ScheduleManagement />;
  if (page === "latest-schedules") return <PlatformSchedules />;
  return <ApplicationsPage page={page} />;
}

export type { PlatformPage };
