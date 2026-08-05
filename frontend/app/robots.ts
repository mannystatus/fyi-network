import type { MetadataRoute } from "next";
import { getCurrentBrand } from "../lib/api";
import { canonicalOrigin } from "../lib/url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await getCurrentBrand();
  return {
    // /admin is the internal article-publishing form (see uploads.py's
    // comment on the same feature) — no reason for it to be crawlable or
    // indexable, and it was previously wide open under the blanket "/" allow.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${canonicalOrigin(brand.domain)}/sitemap.xml`,
  };
}
