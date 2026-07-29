import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Awakening PH Operations Platform",
  description: "The Awakening PH workspace for registrations, schedules, contacts, applications, and sales insights.",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
