import type { Metadata } from "next";
import { AwakeningApp } from "../_components/AwakeningApp";

export const metadata: Metadata = {
  title: "Awakening for Organizations",
  description:
    "Bring the Awakening emotional reset experience to your company, team, or organization in the Philippines.",
  alternates: { canonical: "/awakening-for-organizations" },
  openGraph: {
    title: "Awakening for Organizations | Awakening PH",
    description: "Start a conversation about bringing the reset into your workplace.",
    url: "/awakening-for-organizations",
  },
};

export default function OrganizationsPage() {
  return <AwakeningApp page="organizations" />;
}
