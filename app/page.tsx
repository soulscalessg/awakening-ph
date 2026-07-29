import type { Metadata } from "next";
import { AwakeningApp } from "./_components/AwakeningApp";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <AwakeningApp page="home" />;
}
