import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ??
    incomingHeaders.get("host") ??
    "localhost:3002";
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og-awakening.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: "Awakening PH — The Emotional Reset Experience",
    description:
      "Awakening is a guided emotional reset experience for individuals, teams, and communities across the Philippines.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Awakening PH — The Emotional Reset Experience",
      description:
        "If you’ve been stuck, overthinking, or just surviving, this is where you reset.",
      images: [{ url: imageUrl, width: 1731, height: 909 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Awakening PH — The Emotional Reset Experience",
      description: "August 8 · Baguio",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
