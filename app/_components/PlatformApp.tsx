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
  ["May 30, 2026 · 9:00 AM", "Davao", "pink"],
  ["May 31, 2026 · 9:00 AM", "General Santos", "amber"],
  ["June 20, 2026 · 9:00 AM", "House of Transformation, Ayala the 30th, Pasig", "purple"],
  ["July 18, 2026 · 9:00 AM", "House of Transformation, Ayala the 30th, Pasig", "purple"],
  ["July 27, 2026 · 9:00 AM", "Cebu", "yellow"],
  ["August 15, 2026 · 9:00 AM", "House of Transformation, Ayala the 30th, Pasig", "purple"],
] as const;

const registrants = [
  { code: "DNFHO2", date: "August 15 (Manila)", name: "Jerold Mark Villafuerte", email: "normingh@atarashiitechnologies.co", phone: "09952603643", status: "For Confirmation" },
  { code: "OVCOHL", date: "July 26 (Manila)", name: "Jean Francia", email: "jeanfrancia0695@gmail.com", phone: "+63 994 644 1071", status: "Paid" },
  { code: "L8V6Y7", date: "July 26 (Manila)", name: "Mark Ysrael Ilagan", email: "markysrael06@gmail.com", phone: "+63 626 273 271", status: "Paid" },
];

const navSections = [
  { label: "Account Settings", icon: "⚙", href: "/platform/account", pages: ["account"] },
  { label: "My Platform", icon: "◫", pages: ["system-information"], children: [["System Information", "/platform/system-information", "system-information"]] },
  { label: "Resources", icon: "▣", pages: ["contacts", "document-hub", "photo-library"], children: [["Contacts", "/platform/contacts", "contacts"], ["Document Hub", "/platform/document-hub", "document-hub"], ["Photo Library", "/platform/photo-library", "photo-library"]] },
  { label: "Sales & Administration", icon: "◌", pages: ["sales-revenue", "crm", "registration-center", "seminar-schedule-management"], children: [["Profit & Sales Manager", "/platform/sales-revenue", "sales-revenue"], ["Customer Relationship Manager", "/platform/crm", "crm"], ["Registration Center", "/platform/registration-center", "registration-center"], ["Seminar Schedule Management", "/platform/seminar-schedule-management", "seminar-schedule-management"]] },
  { label: "Latest Schedules", icon: "▢", href: "/platform/latest-schedules", pages: ["latest-schedules"] },
  { label: "Applications", icon: "◧", pages: ["applications-organizations", "applications-staffing", "applications-sponsorship"], children: [["For Organizations", "/platform/applications/organizations", "applications-organizations"], ["For Staffing Team", "/platform/applications/staffing", "applications-staffing"], ["For Sponsorship", "/platform/applications/sponsorship", "applications-sponsorship"]] },
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
  [key: string]: unknown;
};

function usePlatformRecords(resource: string, initial: StoredRecord[] = []) {
  const [records, setRecords] = useState<StoredRecord[]>(initial);
  const [connection, setConnection] = useState<"connecting" | "live" | "unavailable">("connecting");

  useEffect(() => {
    let active = true;
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
    return () => { active = false; };
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

  return { records, connection, createRecord, deleteRecord };
}

function DataConnectionBadge({ state }: { state: "connecting" | "live" | "unavailable" }) {
  const labels = { connecting: "Connecting data", live: "Supabase live", unavailable: "Database setup needed" };
  return <span className={`platform-data-state ${state}`}><i aria-hidden="true" />{labels[state]}</span>;
}

function PlatformShell({ page, children }: { page: PlatformPage; children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="platform-shell">
      <header className="platform-topbar">
        <button className="platform-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileNav((open) => !open)}>☰</button>
        <Link href="/platform" className="platform-brand" aria-label="Awakening platform home"><img src="/awakening/logo-strip.png" alt="Awakening" /></Link>
        <button
          className="platform-avatar"
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={async () => {
            await fetch("/api/platform-logout", { method: "POST" });
            window.location.href = "/";
          }}
        >SS</button>
      </header>
      <aside className={`platform-sidebar ${mobileNav ? "is-open" : ""}`}>
        <nav aria-label="Platform navigation">
          {navSections.map((section) => {
            const expanded = section.pages.includes(page as never);
            return (
              <div className={`platform-nav-group ${expanded ? "is-expanded" : ""}`} key={section.label}>
                {"href" in section ? (
                  <Link className={expanded ? "is-active" : ""} href={section.href} onClick={() => setMobileNav(false)}><span>{section.icon}</span><b>{section.label}</b></Link>
                ) : (
                  <div className="platform-nav-parent"><span>{section.icon}</span><b>{section.label}</b><i>{expanded ? "⌄" : "›"}</i></div>
                )}
                {"children" in section && expanded && (
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
  const [name, setName] = useState("SoulScale Systems");
  const [saved, setSaved] = useState(false);
  return (
    <PlatformShell page="account">
      <GradientBanner variant="pink"><span className="platform-large-avatar">SS</span></GradientBanner>
      <section className="account-panel">
        <header><h1>Account settings</h1><p>Manage your account</p></header>
        <article><label>Email<strong>soulscalesystems@gmail.com</strong></label><label>Password<strong>••••••••••••</strong></label><label>Name*<input value={name} onChange={(event) => setName(event.target.value)} /></label></article>
        <button className="platform-primary" type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}>{saved ? "Updated" : "Update"}</button>
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
      {modal && <Modal title={config[2]} onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get("name")); const contactFields = page === "contacts" ? { email: String(data.get("email")), phone: String(data.get("phone")) } : {}; void createRecord({ name, ...contactFields }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Connect Supabase to save records permanently.")); }} />}
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
      {modal && <Modal title="New Lead" onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void createRecord({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")) }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Connect Supabase to save leads permanently.")); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label="New Lead">＋</button>
    </PlatformShell>
  );
}

function RegistrationCenter() {
  const [tab, setTab] = useState<"insights" | "menu">("insights");
  const [query, setQuery] = useState("");
  const seededRegistrants = registrants.map((record) => ({ ...record, event_date: record.date, status: record.status === "Paid" ? "paid" : "for_confirmation" }));
  const { records, connection } = usePlatformRecords("registrations", seededRegistrants);
  const filtered = records.filter((record) => `${record.name ?? ""} ${record.email ?? ""} ${record.code ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page="registration-center">
      <GradientBanner />
      <section className="platform-dashboard registration-dashboard">
        <header className="registration-title"><div><h1>REGISTRATION CENTER</h1><p>Your complete view of every attendee.</p></div><DataConnectionBadge state={connection} /></header>
        <div className="platform-tabs"><button className={tab === "insights" ? "is-active" : ""} onClick={() => setTab("insights")} type="button">☼ Insights</button><button className={tab === "menu" ? "is-active" : ""} onClick={() => setTab("menu")} type="button">↗ Quick Menu</button></div>
        {tab === "insights" ? <div className="platform-metrics three"><MetricCard label="Total Tickets Sold" value="424" /><MetricCard label="Ticket Sales This Month" value="PHP 181,379.00" /><MetricCard label="Total Gross Profit" value="PHP 635,576.00" /><MetricCard label="Payments for Confirmation" value="2" /><MetricCard label="No. of Registrants This Month" value="71" /><MetricCard label="Total No. of Registrants" value="262" /></div> : <QuickLinks items={["Seminar Schedule Management", "Awakening For Organizations Applications", "Sponsorship Applications", "Staffing Applications"]} />}
        <GradientBanner><div className="platform-banner-greeting"><span>SS</span><div><small>Great to see you, SoulScale</small><h1>Pick up right where you left off</h1></div><SearchBar value={query} onChange={setQuery} placeholder="Search..." /></div></GradientBanner>
        <div className="registration-manager"><div><PageIntro title="REGISTRATION MANAGER" copy="View and manage all event registrants." search={query} onSearch={setQuery} /><div className="platform-filter-row"><button>Confirmation Status⌄</button><button>Date Attending⌄</button><button className="platform-primary">⇩ Export</button></div><div className="registrant-list">{filtered.map((record) => { const paid = record.status === "paid" || record.status === "Paid"; return <article key={String(record.id ?? record.code)}><span className="receipt-thumb">RECEIPT</span><div><b>{String(record.code ?? "NEW")}</b><em>{String(record.event_date ?? "Date pending")}</em><strong>{String(record.name ?? "Registrant")}</strong><a href={`mailto:${String(record.email ?? "")}`}>✉ {String(record.email ?? "—")}</a><a href={`tel:${String(record.phone ?? "")}`}>▯ {String(record.phone ?? "—")}</a><small className={paid ? "paid" : "pending"}>{paid ? "Paid" : "For Confirmation"}</small></div><div><button className="platform-primary" type="button">✎ Edit</button><button type="button">Change Status</button></div></article>; })}</div></div><aside className="platform-calendar"><header><b>Jul 2026</b><div><button>Today</button><button>‹</button><button>›</button></div></header><div className="calendar-grid">{"SMTWTFS".split("").map((day, index) => <b key={`${day}-${index}`}>{day}</b>)}{Array.from({ length: 35 }, (_, index) => <span className={index === 31 ? "today" : ""} key={index}>{index < 3 ? 28 + index : index - 2}</span>)}</div></aside></div>
      </section>
    </PlatformShell>
  );
}

function ScheduleManagement() {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [saveError, setSaveError] = useState("");
  const seededSchedules = schedules.map(([event_at, venue, status]) => ({ event_at, venue, status }));
  const { records: items, connection, createRecord, deleteRecord } = usePlatformRecords("schedules", seededSchedules);
  const visible = items.filter((item) => `${item.event_at ?? ""} ${item.venue ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <PlatformShell page="seminar-schedule-management">
      <GradientBanner variant="pink" />
      <section className="platform-content-section"><DataConnectionBadge state={connection} /><PageIntro title="Seminar Schedule Management" copy="Creating, updating, and managing Awakening seminar schedules in one place." action="New Schedule" search={query} onSearch={setQuery} onAction={() => setAdding(true)} />{saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}<div className="platform-filter-row"><button>Venue⌄</button></div><div className="schedule-manager-list">{visible.map((item, index) => <article key={String(item.id ?? `${item.event_at}-${index}`)}><time>{String(item.event_at ?? "Date pending")}</time><strong className={String(item.status ?? "purple")}>{String(item.venue ?? "Venue pending")}</strong><div><button className="platform-primary">▣ Customize</button><button onClick={() => void deleteRecord(item.id)}>↯ Cancel</button></div></article>)}</div></section>
      {adding && <Modal title="New Schedule" onClose={() => setAdding(false)} onSave={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const eventAt = new Date(Date.now() + 30 * 86400000).toISOString(); void createRecord({ event_at: eventAt, venue: String(data.get("name")), status: "scheduled" }).then(() => { setAdding(false); setSaveError(""); }).catch(() => setSaveError("Connect Supabase to save schedules permanently.")); }} />}
      <button className="platform-floating-add" type="button" onClick={() => setAdding(true)} aria-label="New Schedule">＋</button>
    </PlatformShell>
  );
}

function PlatformSchedules() {
  return <PlatformShell page="latest-schedules"><section className="platform-schedule-page"><header><h1>Awakening: An Emotional Reset<br />Experience</h1><p>Join us for a powerful reset that breaks old patterns and moves you<br />forward.</p></header><div>{schedules.map((item) => <article key={item[0]}><span>▣</span><div><small>Date &amp; Time</small><strong>{item[0]}</strong></div><span>⌾</span><div><small>Venue</small><strong>{item[1]}</strong></div></article>)}</div></section></PlatformShell>;
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
    <PlatformShell page={page}><GradientBanner variant="rainbow" /><section className="platform-content-section"><DataConnectionBadge state={connection} /><PageIntro title={data[0]} copy={data[1]} action={data[2]} search={query} onSearch={setQuery} onAction={() => setModal(true)} />{saveError && <div className="platform-inline-error" role="alert">{saveError}</div>}<div className="application-table"><header>{data[3].map((column) => <span key={column}>{column}</span>)}</header>{visible.length ? visible.map((record) => <div key={String(record.id ?? record.name)}><strong>{String(record.name ?? "Applicant")}</strong><span>{String(record.email ?? "—")}</span><span>{String(record.phone ?? "—")}</span></div>) : <EmptyState />}</div></section>{modal && <Modal title={data[2]} onClose={() => setModal(false)} onSave={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); void createRecord({ name: String(formData.get("name")), email: String(formData.get("email")), phone: String(formData.get("phone")) }).then(() => { setModal(false); setSaveError(""); }).catch(() => setSaveError("Connect Supabase to save applications permanently.")); }} />}<button className="platform-floating-add" type="button" onClick={() => setModal(true)} aria-label={data[2]}>＋</button></PlatformShell>
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
