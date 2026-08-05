import type { MetadataRoute } from "next";
import { getCurrentBrand, getArticles } from "../lib/api";
import { canonicalOrigin } from "../lib/url";
import { CAMS_REVIEWS } from "../lib/camsReviews";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = await getCurrentBrand();
  const articles = await getArticles(undefined, 5000);
  const base = canonicalOrigin(brand.domain);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.3 },
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

  // fyiCams-only: individual product reviews (Sony, Leica, Nikon, DJI,
  // Insta360, etc.) are the pages actually meant to rank for
  // "<product name> review" searches — omitted here before, so Google had
  // no sitemap signal that they exist or how important they are.
  const reviewEntries: MetadataRoute.Sitemap =
    brand.icon === "cams"
      ? [
          { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.7 },
          ...Object.values(CAMS_REVIEWS).map((r) => ({
            url: `${base}/reviews/${r.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.9,
          })),
        ]
      : [];

  return [...staticEntries, ...articleEntries, ...reviewEntries];
}
