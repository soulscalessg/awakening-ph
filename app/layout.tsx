import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://awakening-ph-platform.soulsync.workers.dev";
const SITE_NAME = "Awakening PH";
const SITE_DESCRIPTION =
  "Awakening PH is a guided emotional reset experience for individuals, teams, and communities across the Philippines.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050908",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Awakening PH — The Emotional Reset Experience",
    template: "%s | Awakening PH",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Awakening PH",
    "emotional reset Philippines",
    "personal breakthrough seminar",
    "emotional wellness experience",
    "team emotional wellness Philippines",
    "guided reflection Philippines",
  ],
  creator: "Awakening Philippines",
  publisher: "Awakening Philippines",
  category: "wellness",
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Awakening PH — The Emotional Reset Experience",
    description:
      "If you’ve been stuck, overthinking, or just surviving, this is where you reset.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-awakening.png",
        width: 1731,
        height: 909,
        alt: "Awakening PH — The Emotional Reset Experience",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awakening PH — The Emotional Reset Experience",
    description:
      "A guided day for honest reflection, emotional release, and renewed direction.",
    images: ["/og-awakening.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Awakening Philippines",
      alternateName: "Awakening PH",
      url: SITE_URL,
      logo: `${SITE_URL}/awakening/logo-transparent-2026.png`,
      sameAs: ["https://www.facebook.com/search/top?q=Awakened%20Nation"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-PH",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
