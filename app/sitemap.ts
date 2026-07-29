import type { MetadataRoute } from "next";

const routes = [
  "",
  "/latest-schedules",
  "/registration",
  "/awakening-for-organizations",
  "/be-part-of-awakening",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-29T00:00:00+08:00");

  return routes.map((route, index) => ({
    url: `https://awakening-ph-official.soulscaleacademy.workers.dev${route}`,
    lastModified,
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.8,
  }));
}
