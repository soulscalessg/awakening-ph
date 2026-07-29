import type { Metadata } from "next";
import { AwakeningApp } from "../_components/AwakeningApp";

export const metadata: Metadata = {
  title: "Upcoming Emotional Reset Schedules",
  description:
    "View upcoming Awakening PH emotional reset sessions, dates, times, and venues across the Philippines.",
  alternates: { canonical: "/latest-schedules" },
  openGraph: {
    title: "Upcoming Emotional Reset Schedules | Awakening PH",
    description: "Find the next Awakening PH session and reserve your place.",
    url: "/latest-schedules",
  },
};

export default function LatestSchedulesPage() {
  return <AwakeningApp page="schedules" />;
}
