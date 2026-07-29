import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Awakening PH — The Emotional Reset Experience",
    short_name: "Awakening PH",
    description:
      "A guided emotional reset experience for individuals, teams, and communities across the Philippines.",
    start_url: "/",
    display: "standalone",
    background_color: "#050908",
    theme_color: "#050908",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
