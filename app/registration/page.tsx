import type { Metadata } from "next";
import { AwakeningApp } from "../_components/AwakeningApp";

export const metadata: Metadata = {
  title: "Reserve Your Awakening Session",
  description:
    "Choose an Awakening PH session, reserve your tickets, and submit your registration securely online.",
  alternates: { canonical: "/registration" },
  openGraph: {
    title: "Reserve Your Awakening Session | Awakening PH",
    description: "Choose your preferred session and secure your place in the room.",
    url: "/registration",
  },
};

export default function RegistrationPage() {
  return <AwakeningApp page="registration" />;
}
