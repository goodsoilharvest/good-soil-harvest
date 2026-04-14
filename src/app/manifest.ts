import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Good Soil Harvest",
    short_name: "Good Soil",
    description:
      "Thoughtful writing on faith, money, psychology, philosophy, and science — for people who want to think deeply and live well.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#1e0f06",
    theme_color: "#2e1a0a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
