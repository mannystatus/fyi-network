import type { MetadataRoute } from "next";
import { getCurrentBrand } from "../lib/api";
import { canonicalOrigin } from "../lib/url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await getCurrentBrand();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${canonicalOrigin(brand.domain)}/sitemap.xml`,
  };
}
