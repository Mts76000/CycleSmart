import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Auth pages and /profil are low-value for search indexing and are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const mainRoutes = ["/", "/calculer", "/creneaux", "/machines"];
  const legalRoutes = ["/conditions-generales", "/politique-de-confidentialite", "/cookies"];

  return [
    ...mainRoutes.map((route) => ({
      url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: route === "/" || route === "/calculer" ? 1 : 0.7,
    })),
    ...legalRoutes.map((route) => ({
      url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
