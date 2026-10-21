import type { MetadataRoute } from "next";
import { seedData } from "@/lib/seed-data";

/**
 * Generates `/sitemap.xml` listing every public route Techstar exposes.
 * Excludes admin + preview routes (they're `noindex` + behind auth).
 *
 * Note: the canonical base URL is `https://techstar.example` — replace
 * with the real production domain before going live. The same value
 * is set in `src/app/layout.tsx` `metadata.metadataBase`.
 */
const BASE_URL = "https://techstar.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: lastMonth, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: lastMonth, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/industries`, lastModified: lastMonth, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/projects`, lastModified: lastMonth, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/insights`, lastModified: lastMonth, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: lastMonth, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: lastMonth, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: lastMonth, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: lastMonth, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookie-preferences`, lastModified: lastMonth, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = seedData.services.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: lastMonth,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const industryRoutes: MetadataRoute.Sitemap = seedData.industries.map((i) => ({
    url: `${BASE_URL}/industries/${i.slug}`,
    lastModified: lastMonth,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = seedData.projects
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: lastMonth,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const articleRoutes: MetadataRoute.Sitemap = seedData.articles
    .filter((a) => a.status === "published")
    .map((a) => ({
      url: `${BASE_URL}/insights/${a.slug}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : lastMonth,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...projectRoutes, ...articleRoutes];
}
