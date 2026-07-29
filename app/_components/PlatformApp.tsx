"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";

type PlatformPage =
  | "system-information"
  | "account"
  | "contacts"
  | "document-hub"
  | "photo-library"
  | "sales-revenue"
  | "crm"
  | "registration-center"
  | "seminar-schedule-management"
  | "latest-schedules"
  | "applications-organizations"
  | "applications-staffing"
  | "applications-sponsorship";

const schedules = [
  ["2026-05-30T09:00:00+08:00", "Davao", "scheduled"],
  ["2026-05-31T09:00:00+08:00", "General Santos", "scheduled"],
  ["2026-06-20T09:00:00+08:00", "House of Transformation, Ayala the 30th, Pasig", "scheduled"],
  ["2026-07-18T09:00:00+08:00", "House of Transformation, Ayala the 30th, Pasig", "scheduled"],
  ["2026-07-27T09:00:00+08:00", "Cebu", "scheduled"],
  ["2026-08-15T09:00:00+08:00", "House of Transformation, Ayala the 30th, Pasig", "scheduled"],
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
  { label: "Resources", icon: "▣", pages: ["contacts", "document-hub", "photo-library"], children: [["Contacts", "/platform/contacts", "contacts"], ["Document Hub", "/platform/document-hub", "document-hub"], ["Photo Library", "/platform/photo-library", "photo-library"]] },
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
  event_date?: string;
  code?: string;
  status?: string;
  created_at?: string;
  quantity?: number;
  total_amount?: number | string;
  city?: string;
  capacity?: number;
  business_name?: string;
  industry?: string;
  employee_count?: number;
  [key: string]: unknown;
};

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
  return <article className="platform-metric"><span>{label}</span><strong>{value}</strong><small>Last updated at 08:43 AM ↻</small></article>;
}

function QuickLinks({ items }: { items: string[] }) {
  return <div className="platform-quick-links">{items.map((item) => <button type="button" key={item}><span>◉</span><b>{item}</b><i>›</i></button>)}</div>;
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
  const localEventAt = record?.event_at ? (() => {
    const date = new Date(record.event_at);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  })() : "";

  return (
    <div className="platform-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="platform-modal schedule-editor-modal" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        setError("");
        void onSave({
          event_at: new Date(String(data.get("event_at"))).toISOString(),
          venue: String(data.get("venue")),
          city: String(data.get("city")),
          capacity: Math.max(0, Number(data.get("capacity")) || 0),
          status: String(data.get("status") || "scheduled"),
        }).catch(() => setError("This schedule could not be saved. Please check the details and try again.")).finally(() => setSaving(false));
      }} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span className="admin-eyebrow">Public schedule</span><h2>{record ? "Edit session" : "Create a session"}</h2></div><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
        <p>Publishing a session updates Latest Schedules and Secure My Slot automatically.</p>
        <label>Date and time<input name="event_at" type="datetime-local" required defaultValue={localEventAt} /></label>
        <label>Venue<input name="venue" required defaultValue={record?.venue ?? ""} placeholder="House of Transformation, Ayala the 30th" /></label>
        <div className="schedule-editor-grid"><label>City<input name="city" defaultValue={record?.city ?? ""} placeholder="Pasig" /></label><label>Capacity<input name="capacity" type="number" min="0" defaultValue={record?.capacity ?? ""} placeholder="100" /></label></div>
        <label>Publishing status<select name="status" defaultValue={record?.status ?? "scheduled"}><option value="scheduled">Published</option><option value="draft">Draft</option><option value="cancelled">Cancelled</option></select></label>
        {error && <div className="platform-inline-error" role="alert">{error}</div>}
        <footer><button type="button" onClick={onClose}>Cancel</button><button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : record ? "Save changes" : "Publish schedule"}</button></footer>
      </form>
    </div>
  );
}

type ExtractedSchedule = {
  event_at: string;
  venue: string;
  city: string;
  capacity: number;
  status: string;
};

const scheduleMonths: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
  may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8,
  sep: 8, sept: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
};

const philippineCities = ["Manila", "Pasig", "Cebu", "Davao", "Baguio", "Pampanga", "Laguna", "Marikina", "Quezon", "Rizal", "Olongapo", "General Santos", "Makati", "Taguig", "Mandaluyong", "Cavite", "Batangas", "Iloilo", "Bacolod"];

function toLocalDateTimeValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function parseScheduleSource(source: string): ExtractedSchedule[] {
  const cleaned = source.replace(/\r/g, "\n").replace(/[•●▪◦]/g, "\n").replace(/\n{2,}/g, "\n");
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
    return {
      event_at: toLocalDateTimeValue(new Date(year, month, day, hour, minute)),
      venue,
      city,
      capacity,
      status: "scheduled",
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
        {records.length > 0 && <div className="schedule-extractor-results"><header><div><span className="admin-eyebrow">Ready to review</span><h3>{records.length} schedule{records.length === 1 ? "" : "s"} found</h3></div><span>Edit anything before publishing</span></header>{records.map((record, index) => <article key={`${record.event_at}-${index}`}><span className="schedule-result-number">{String(index + 1).padStart(2, "0")}</span><label>Date and time<input type="datetime-local" value={record.event_at} onChange={(event) => updateRecord(index, { event_at: event.target.value })} /></label><label>Venue<input value={record.venue} onChange={(event) => updateRecord(index, { venue: event.target.value })} /></label><label>City<input value={record.city} onChange={(event) => updateRecord(index, { city: event.target.value })} /></label><label>Seats<input type="number" min="0" value={record.capacity || ""} onChange={(event) => updateRecord(index, { capacity: Number(event.target.value) || 0 })} /></label><button type="button" aria-label={`Remove schedule ${index + 1}`} onClick={() => setRecords((current) => current.filter((_, recordIndex) => recordIndex !== index))}>×</button></article>)}</div>}
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
          <footer><span>▣ Last Updated</span><b>Jun 25, 2026, 04:29 PM</b></footer>
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

function ResourcePage({ page }: { page: "contacts" | "document-hub" | "photo-library" }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const config = {
    contacts: ["Contact Library", "Central database of all partners and contacts for tracking and follow-up.", "New Contact"],
    "document-hub": ["Document Hub", "Centralized storage for all project, client, and operational documents.", "Add New File"],
    "photo-library": ["Photo Library", "Fresh day ahead — let's make it count", "Create New Gallery"],
  }[page];
  const resource = { contacts: "contacts", "document-hub": "documents", "photo-library": "galleries" }[page];
  const { records, connection, createRecord, deleteRecord } = usePlatformRecords(resource);
  const filtered = records.filter((record) => String(record.name ?? "").toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page={page}>
      <GradientBanner variant={page === "photo-library" ? "rainbow" : "blue"} />
      {page === "photo-library" && <div className="platform-greeting"><span>☀</span><div><h1>Good morning, SoulScale</h1><p>{config[1]}</p></div></div>}
      <section className="platform-content-section">
        {page === "document-hub" && <QuickLinks items={["Contacts", "Photo Library", "Seminar Schedule Management"]} />}
        <DataConnectionBadge state={connection} />
        <PageIntro title={config[0]} copy={page === "photo-library" ? undefined : config[1]} action={config[2]} search={query} onSearch={setQuery} onAction={() => setModal(true)} />
        {saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}
        {filtered.length ? <div className="platform-record-grid">{filtered.map((record) => <article key={record.id ?? String(record.name)}><span>SS</span><div><b>{String(record.name ?? "Untitled")}</b><small>{record.email ? String(record.email) : "Saved to workspace"}</small></div><button type="button" aria-label={`Delete ${String(record.name ?? "record")}`} onClick={() => void deleteRecord(record.id)}>×</button></article>)}</div> : <EmptyState message={page === "contacts" ? "No results found, try adjusting your search and filters." : undefined} />}
      </section>
      {modal && <Modal title={config[2]} onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get("name")); const contactFields = page === "contacts" ? { email: String(data.get("email")), phone: String(data.get("phone")) } : {}; void createRecord({ name, ...contactFields }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Awakening Server could not save this record.")); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label={config[2]}>＋</button>
    </PlatformShell>
  );
}

function LineChart({ color = "#3b82f6", fill = false }: { color?: string; fill?: boolean }) {
  return <div className={`platform-line-chart ${fill ? "with-fill" : ""}`}><span /><span /><span /><span /><i style={{ borderColor: color }} /><b style={{ color }}>●</b></div>;
}

function SalesRevenue() {
  return (
    <PlatformShell page="sales-revenue">
      <GradientBanner><div className="platform-banner-greeting"><span>SS</span><div><small>Great to see you, SoulScale</small><h1>Ready for a productive day?</h1></div><SearchBar value="" onChange={() => undefined} placeholder="Search..." /></div></GradientBanner>
      <section className="platform-dashboard">
        <div className="platform-metrics four"><MetricCard label="Total Tickets Sold" value="424" /><MetricCard label="Ticket Sales This Month" value="PHP 181,379.00" /><MetricCard label="Total Gross Profit (All-Time)" value="PHP 635,576.00" /><MetricCard label="No. of Registrants This Month" value="71" /></div>
        <div className="platform-chart-grid two"><article><h2>Sales Growth Rate (MoM %)</h2><LineChart color="#ff2323" /></article><article><h2>Tickets Sold (Over Time)</h2><LineChart color="#4095ff" fill /></article></div>
        <div className="platform-chart-grid three"><article><h2>Ticket Purchase Trends</h2><div className="platform-pie" /></article><article><h2>Average Ticket Quantity Over Time</h2><LineChart color="#f04da1" fill /></article><article><h2>Revenue by Location</h2><div className="platform-donut"><span>Manila<br />53%</span></div></article></div>
        <div className="platform-chart-grid two"><article><h2>Revenue Per Day</h2><div className="platform-bars">{[22,42,18,31,47,62,35,73,88,54,79,25].map((height, index) => <span style={{ height: `${height}%` }} key={index} />)}</div></article><article><h2>Ticket Quantity Trend Breakdown</h2><div className="platform-donut large"><span>195<br /><small>tickets</small></span></div></article></div>
      </section>
    </PlatformShell>
  );
}

function CRM() {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { records: leads, connection, createRecord } = usePlatformRecords("leads");
  const visibleLeads = leads.filter((lead) => String(lead.name ?? "").toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page="crm">
      <GradientBanner><div className="platform-banner-greeting"><div><h1>Great to see you, SoulScale</h1><p>Everything you need, all in one place</p></div><SearchBar value={query} onChange={setQuery} placeholder="Search..." /></div></GradientBanner>
      <section className="platform-dashboard">
        <h2 className="platform-section-title">Registration Links</h2><QuickLinks items={["General (July 18 – December 5)", "Registration May 30 (Davao)", "Registration May 31 (Gensan)"]} />
        <div className="platform-chart-grid two"><article><h2>Lead Stage Overview</h2><div className="platform-donut muted"><span>No data</span></div></article><article><h2>Total Leads</h2><div className="platform-no-data">No data</div></article></div>
        <div className="platform-tabs"><button className="is-active" type="button">☼ Overview</button></div>
        <div className="platform-metrics four"><MetricCard label="Closed Deals (This Month)" value="0" /><MetricCard label="Revenue Closed (This Month)" value="₱0.00" /><MetricCard label="Total Leads (This Week)" value="0" /><MetricCard label="Pipeline Value" value="₱0.00" /></div>
        <div className="platform-split"><div><DataConnectionBadge state={connection} /><PageIntro title="Customer Relationship Management" copy="Track, manage, and strengthen every client interaction." action="New Lead" search={query} onSearch={setQuery} onAction={() => setModal(true)} />{saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}<div className="platform-filter-row"><button>Assigned To⌄</button><button>Lead Source⌄</button><button>Status / Stage⌄</button></div>{visibleLeads.length ? <div className="platform-record-grid">{visibleLeads.map((lead) => <article key={lead.id ?? String(lead.name)}><span>SS</span><div><b>{String(lead.name ?? "Untitled lead")}</b><small>{String(lead.email ?? "New lead")}</small></div></article>)}</div> : <EmptyState message="No results found, try adjusting your search and filters." />}</div><aside><h2>Quick Menu</h2><QuickLinks items={["Registration Center", "Sales & Revenue", "Seminar Schedule Management"]} /></aside></div>
      </section>
      {modal && <Modal title="New Lead" onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void createRecord({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")) }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Awakening Server could not save this lead.")); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label="New Lead">＋</button>
    </PlatformShell>
  );
}

function RegistrationCenter() {
  const [query, setQuery] = useState("");
  const [saveError, setSaveError] = useState("");
  const seededRegistrants = registrants.map((record) => ({ ...record, event_date: record.date, status: record.status === "Paid" ? "paid" : "for_confirmation" }));
  const { records, connection, updateRecord } = usePlatformRecords("registrations", seededRegistrants);
  const filtered = records.filter((record) => `${record.name ?? ""} ${record.email ?? ""} ${record.code ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const tickets = records.reduce((sum, record) => sum + (Number(record.quantity) || 1), 0);
  const revenue = records.reduce((sum, record) => sum + (Number(record.total_amount) || 0), 0);
  const pending = records.filter((record) => record.status === "for_confirmation" || record.status === "For Confirmation").length;

  function exportRegistrations() {
    const header = ["Code", "Name", "Email", "Phone", "Schedule", "Quantity", "Amount", "Status"];
    const rows = records.map((record) => [record.code, record.name, record.email, record.phone, record.event_date, record.quantity, record.total_amount, record.status]);
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
          <article><span>Total registrations</span><strong>{records.length}</strong><small>People in the database</small></article>
          <article><span>Tickets reserved</span><strong>{tickets}</strong><small>Across all schedules</small></article>
          <article><span>Gross bookings</span><strong>₱{revenue.toLocaleString("en-PH")}</strong><small>Submitted registration value</small></article>
          <article className={pending ? "needs-attention" : ""}><span>For confirmation</span><strong>{pending}</strong><small>{pending ? "Needs your attention" : "Nothing pending"}</small></article>
        </div>

        <section className="admin-registration-panel">
          <header><div><span className="admin-eyebrow">Attendee database</span><h2>Registrations</h2><p>Search attendees, review their payment state, and confirm them in one click.</p></div><div><SearchBar value={query} onChange={setQuery} placeholder="Search name, email, or code" /><button type="button" onClick={exportRegistrations}>Export CSV</button></div></header>
          {saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}
          <div className="admin-registration-table">
            <div className="admin-table-head"><span>Attendee</span><span>Schedule</span><span>Booking</span><span>Status</span><span>Action</span></div>
            {filtered.length ? filtered.map((record) => {
              const paid = record.status === "paid" || record.status === "Paid";
              const rejected = record.status === "rejected" || record.status === "Rejected";
              return (
                <article key={String(record.id ?? record.code)}>
                  <div className="admin-attendee"><b>{String(record.name ?? "Registrant").slice(0, 1)}</b><span><strong>{String(record.name ?? "Registrant")}</strong><a href={`mailto:${String(record.email ?? "")}`}>{String(record.email ?? "—")}</a><small>{String(record.code ?? "NEW")}</small></span></div>
                  <div><strong>{String(record.event_date ?? "Date pending")}</strong><small>{String(record.phone ?? "—")}</small></div>
                  <div><strong>{Number(record.quantity) || 1} ticket{Number(record.quantity) === 1 ? "" : "s"}</strong><small>₱{(Number(record.total_amount) || 0).toLocaleString("en-PH")}</small></div>
                  <span className={`admin-status ${paid ? "paid" : rejected ? "rejected" : "pending"}`}><i />{paid ? "Paid" : rejected ? "Rejected" : "For confirmation"}</span>
                  <button
                    type="button"
                    disabled={!record.id}
                    onClick={() => void updateRecord(record.id, { status: rejected ? "for_confirmation" : paid ? "for_confirmation" : "paid" }).then(() => setSaveError("")).catch(() => setSaveError("The registration status could not be updated."))}
                  >{rejected ? "Move to review" : paid ? "Reopen" : "Confirm paid"}</button>
                </article>
              );
            }) : <EmptyState message="No registrations match your search." />}
          </div>
        </section>
      </section>
    </PlatformShell>
  );
}

function ScheduleManagement() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StoredRecord | null | undefined>(undefined);
  const [extractorOpen, setExtractorOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const seededSchedules = schedules.map(([event_at, venue, status]) => ({ event_at, venue, status }));
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
            return <article key={String(item.id ?? `${item.event_at}-${index}`)}><time><b>{item.event_at ? new Intl.DateTimeFormat("en-PH", { day: "2-digit", timeZone: "Asia/Manila" }).format(new Date(item.event_at)) : "—"}</b><span>{item.event_at ? new Intl.DateTimeFormat("en-PH", { month: "short", year: "numeric", timeZone: "Asia/Manila" }).format(new Date(item.event_at)) : "Date pending"}</span></time><div><span className={`admin-status ${published ? "paid" : "pending"}`}><i />{published ? "Published" : String(item.status ?? "Draft")}</span><h3>{String(item.city || "Awakening session")}</h3><p>{String(item.venue ?? "Venue pending")}</p><small>{item.event_at ? new Intl.DateTimeFormat("en-PH", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(new Date(item.event_at)) : ""}{item.capacity ? ` · ${item.capacity} seats` : ""}</small></div><div><button type="button" onClick={() => setEditing(item)}>Edit</button><button type="button" disabled={!item.id} onClick={() => void updateRecord(item.id, { status: published ? "draft" : "scheduled" }).then(() => setSaveError("")).catch(() => setSaveError("The publishing status could not be changed."))}>{published ? "Unpublish" : "Publish"}</button></div></article>;
          })}</div>
        </section>
      </section>
      {editing !== undefined && <ScheduleModal record={editing ?? undefined} onClose={() => setEditing(undefined)} onSave={async (payload) => { if (editing?.id) await updateRecord(editing.id, payload); else await createRecord(payload); setEditing(undefined); setSaveError(""); }} />}
      {extractorOpen && <ScheduleExtractor onClose={() => setExtractorOpen(false)} onImport={async (extracted) => { for (const item of extracted) await createRecord({ ...item, event_at: new Date(item.event_at).toISOString() }); setExtractorOpen(false); setSaveError(""); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setEditing(null)} aria-label="New Schedule">＋</button>
    </PlatformShell>
  );
}

function PlatformSchedules() {
  const seededSchedules = schedules.map(([event_at, venue, status]) => ({ event_at, venue, status }));
  const { records, connection } = usePlatformRecords("schedules", seededSchedules);
  return <PlatformShell page="latest-schedules"><section className="platform-schedule-page"><header><DataConnectionBadge state={connection} /><h1>Awakening: An Emotional Reset<br />Experience</h1><p>This is the same live schedule shown on the public website and registration page.</p></header><div>{records.filter((item) => item.status === "scheduled").map((item, index) => <article key={String(item.id ?? index)}><span>▣</span><div><small>Date &amp; Time</small><strong>{item.event_at ? new Intl.DateTimeFormat("en-PH", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(item.event_at)) : "Date pending"}</strong></div><span>⌾</span><div><small>Venue</small><strong>{String(item.venue ?? "Venue pending")}</strong></div></article>)}</div></section></PlatformShell>;
}

function ApplicationsPage({ page }: { page: "applications-organizations" | "applications-staffing" | "applications-sponsorship" }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const data = {
    "applications-organizations": ["Awakening for Organizations Applications", "Database for organizations interested in bringing Awakening to their team.", "New Applicant", ["How did you find…", "Owner/CEO Name", "Email address", "Contact number", "Business Name", "Industry", "How many employees do you have?"]],
    "applications-staffing": ["Staffing Team Applicants", "Internal database for Awakening staff applicants.", "Add record", ["Name", "Facebook link", "Email address", "Contact number"]],
    "applications-sponsorship": ["Sponsorship Applications", "", "New Applicant", ["How did you find…", "Owner/CEO Name", "Email address", "Contact number", "Business Name", "Industry", "What are your products"]],
  }[page] as [string, string, string, string[]];
  const resource = { "applications-organizations": "organization-applications", "applications-staffing": "staffing-applications", "applications-sponsorship": "sponsorship-applications" }[page];
  const { records, connection, createRecord } = usePlatformRecords(resource);
  const visible = records.filter((record) => String(record.name ?? "").toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page={page}><GradientBanner variant="rainbow" /><section className="platform-content-section"><DataConnectionBadge state={connection} /><PageIntro title={data[0]} copy={data[1]} action={data[2]} search={query} onSearch={setQuery} onAction={() => setModal(true)} />{saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}<div className="application-table"><header>{data[3].map((column) => <span key={column}>{column}</span>)}</header>{visible.length ? visible.map((record) => <div key={String(record.id ?? record.name)}><strong>{String(record.name ?? "Applicant")}</strong><span>{String(record.email ?? "—")}</span><span>{String(record.phone ?? "—")}</span></div>) : <EmptyState />}</div></section>{modal && <Modal title={data[2]} onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); void createRecord({ name: String(formData.get("name")), email: String(formData.get("email")), phone: String(formData.get("phone")) }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Awakening Server could not save this application.")); }} />}<button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label={data[2]}>＋</button></PlatformShell>
  );
}

export function PlatformApp({ page }: { page: PlatformPage }) {
  if (page === "system-information") return <SystemInformation />;
  if (page === "account") return <AccountSettings />;
  if (page === "contacts" || page === "document-hub" || page === "photo-library") return <ResourcePage page={page} />;
  if (page === "sales-revenue") return <SalesRevenue />;
  if (page === "crm") return <CRM />;
  if (page === "registration-center") return <RegistrationCenter />;
  if (page === "seminar-schedule-management") return <ScheduleManagement />;
  if (page === "latest-schedules") return <PlatformSchedules />;
  return <ApplicationsPage page={page} />;
}

export type { PlatformPage };
