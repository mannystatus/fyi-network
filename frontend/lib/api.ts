import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, path: string) {
    super(`API error ${status} for ${path}`);
    this.status = status;
  }
}

/** Server-side fetch that tells the backend which brand this request is for. */
async function apiFetch(path: string, revalidate = 60) {
  const h = await headers();
  const brandSlug = h.get("x-brand-slug") || "fyimac";

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "X-Brand-Slug": brandSlug },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new ApiError(res.status, path);
  }
  return res.json();
}

export type Brand = {
  slug: string;
  name: string;
  domain: string;
  accent_color: string;
  tagline: string;
  icon: "mac" | "win" | "google" | "netflix" | "flynow" | "lakers" | "dodgers" | "cams";
  topics: string[];
  image_url: string | null;
};

export type ArticleListItem = {
  slug: string;
  category: string | null;
  title: string;
  dek: string | null;
  author: string | null;
  published_at: string;
  is_featured: boolean;
  image_url: string | null;
};

export type ArticleDetail = ArticleListItem & { body_md: string };

export type TravelAdvisory = {
  source: "US" | "UK";
  country: string;
  level: string;
  severity: number;
  scope: "whole_country" | "parts";
  url: string;
  advisory_updated_at: string | null;
};

// Brand metadata (name/topics/accent color/etc.) changes rarely — every
// page on every brand fetches this via template.tsx, so a longer window
// than the 60s default cuts real backend round-trips per request without
// hurting freshness (an admin image/tagline edit shows up within 5 min).
const BRAND_REVALIDATE = 300;
export const getCurrentBrand = (): Promise<Brand> => apiFetch("/api/brands/current", BRAND_REVALIDATE);
export const getAllBrands = (): Promise<Brand[]> => apiFetch("/api/brands", BRAND_REVALIDATE);
// Refreshed every 6h by the ingest job (see .github/workflows/travel-advisories.yml)
// — a longer revalidate than the 60s default keeps this from hammering the
// backend for data that can't have changed since the last ingest run.
export const getTravelAdvisories = (): Promise<TravelAdvisory[]> =>
  apiFetch("/api/travel-advisories", 1800);

export type VisaPassport = { code: string; name: string };
export type VisaRequirement = { country: string; requirement: string };

// The passport-index-data source only refreshes every few weeks (see
// .github/workflows/visa-requirements.yml) — an even longer revalidate
// than advisories.
const VISA_REVALIDATE = 6 * 60 * 60;
export const getVisaPassports = (): Promise<VisaPassport[]> =>
  apiFetch("/api/visa-requirements/passports", VISA_REVALIDATE);
export const getVisaRequirements = (passportCode: string): Promise<VisaRequirement[]> =>
  apiFetch(`/api/visa-requirements?passport=${encodeURIComponent(passportCode)}`, VISA_REVALIDATE);
export const getArticles = (
  category?: string,
  limit?: number,
  offset?: number,
  q?: string,
  featuredOnly?: boolean
): Promise<ArticleListItem[]> => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  if (q) params.set("q", q);
  if (featuredOnly) params.set("featured_only", "true");
  const qs = params.toString();
  return apiFetch(qs ? `/api/articles?${qs}` : "/api/articles");
};
export const getArticle = (slug: string): Promise<ArticleDetail> =>
  apiFetch(`/api/articles/${slug}`);
