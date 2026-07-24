import type { MetadataRoute } from "next";
import { getCurrentBrand } from "../lib/api";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await getCurrentBrand();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `https://${brand.domain}/sitemap.xml`,
  };
}
