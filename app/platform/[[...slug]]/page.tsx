import { PlatformApp, type PlatformPage } from "../../_components/PlatformApp";

const pageMap: Record<string, PlatformPage> = {
  "": "system-information",
  account: "account",
  "system-information": "system-information",
  contacts: "contacts",
  "document-hub": "document-hub",
  "photo-library": "photo-library",
  "sales-revenue": "sales-revenue",
  crm: "crm",
  "registration-center": "registration-center",
  "seminar-schedule-management": "seminar-schedule-management",
  "latest-schedules": "latest-schedules",
  "applications/organizations": "applications-organizations",
  "applications/staffing": "applications-staffing",
  "applications/sponsorship": "applications-sponsorship",
};

export default async function PlatformRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const page = pageMap[slug.join("/")] ?? "system-information";
  return <PlatformApp page={page} />;
}
