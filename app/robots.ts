import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/platform/"],
    },
    sitemap: "https://awakening-ph-platform.soulsc.workers.dev/sitemap.xml",
    host: "https://awakening-ph-platform.soulsc.workers.dev",
  };
}
