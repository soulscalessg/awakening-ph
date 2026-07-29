import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/platform/"],
    },
    sitemap: "https://soulpreneur.ph/sitemap.xml",
    host: "https://soulpreneur.ph",
  };
}
