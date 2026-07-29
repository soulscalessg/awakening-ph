import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PLATFORM_SESSION_COOKIE,
  verifyPlatformSession,
} from "../platform-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Awakening PH Operations Platform",
  description: "The Awakening PH workspace for registrations, schedules, contacts, applications, and sales insights.",
};

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authenticated = await verifyPlatformSession(
    cookieStore.get(PLATFORM_SESSION_COOKIE)?.value,
  );

  if (!authenticated) {
    redirect("/login?next=/platform");
  }

  return children;
}
