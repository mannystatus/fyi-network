import type { MetadataRoute } from "next";
import { getCurrentBrand, getArticles } from "../lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = await getCurrentBrand();
  const articles = await getArticles(undefined, 5000);
  const base = `https://${brand.domain}`;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...brand.topics.map((topic) => ({
      url: `${base}/topics/${encodeURIComponent(topic)}`,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/${a.slug}`,
    lastModified: new Date(a.published_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...articleEntries];
}
