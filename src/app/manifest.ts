import type { MetadataRoute } from "next";
import { STUDIO } from "@/lib/brand";
import { PALETTE } from "@/lib/palette";

// The installable site: the name, the page's own dark and the mark (public/brand, built with
// the logo; the maskable one keeps the mark inside the safe zone for round and squircle masks).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${STUDIO} · Two-person creative studio`,
    short_name: STUDIO,
    description:
      "We’re a two-person studio crafting brands, websites and apps end-to-end: strategy, design and build, all under one roof.",
    start_url: "/",
    display: "standalone",
    background_color: PALETTE.bg,
    theme_color: PALETTE.bg,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
