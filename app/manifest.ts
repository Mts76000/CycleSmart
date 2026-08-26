import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CycleSmart",
    short_name: "CycleSmart",
    description: "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.",
    start_url: "/calculer",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5f7f7",
    theme_color: "#047857",
    lang: "fr",
    categories: ["productivity", "utilities"],
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        label: "Calculateur mobile CycleSmart",
      },
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Tableau de bord CycleSmart sur ordinateur",
      },
    ],
  };
}
