import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Only public, indexable pages. Auth pages, /account, and legal placeholders are
// low-value for search indexing and are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.NEXT_PUBLIC_APP_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
