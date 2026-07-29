import type { Metadata } from "next";
import { AwakeningApp } from "../_components/AwakeningApp";

export const metadata: Metadata = {
  title: "Be Part of Awakening",
  description:
    "Discover ways to attend, partner with, support, or bring Awakening PH to your community or organization.",
  alternates: { canonical: "/be-part-of-awakening" },
  openGraph: {
    title: "Be Part of Awakening | Awakening PH",
    description: "There is a place for you in the Awakening movement.",
    url: "/be-part-of-awakening",
  },
};

export default function BePartPage() {
  return <AwakeningApp page="community" />;
}
