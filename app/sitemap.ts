import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/calculer",
    "/creneaux",
    "/machines",
    "/profil",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/conditions-generales",
    "/politique-de-confidentialite",
    "/cookies",
  ];

  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" || route === "/calculer" ? 1 : 0.7,
  }));
}
