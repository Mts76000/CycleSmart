import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Only public, indexable pages. Auth pages, /profil, and legal placeholders are
// low-value for search indexing and are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/calculer", "/creneaux", "/machines"];

  return routes.map((route) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" || route === "/calculer" ? 1 : 0.7,
  }));
}
