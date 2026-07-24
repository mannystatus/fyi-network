import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Server-side fetch that tells the backend which brand this request is for. */
async function apiFetch(path: string, revalidate = 60) {
  const h = await headers();
  const brandSlug = h.get("x-brand-slug") || "fyimac";

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "X-Brand-Slug": brandSlug },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return res.json();
}

export type Brand = {
  slug: string;
  name: string;
  domain: string;
  accent_color: string;
  tagline: string;
  icon: "mac" | "win" | "google" | "netflix";
  topics: string[];
};

export type ArticleListItem = {
  slug: string;
  category: string | null;
  title: string;
  dek: string | null;
  author: string | null;
  published_at: string;
};

export type ArticleDetail = ArticleListItem & { body_md: string };

export const getCurrentBrand = (): Promise<Brand> => apiFetch("/api/brands/current");
export const getAllBrands = (): Promise<Brand[]> => apiFetch("/api/brands");
export const getArticles = (category?: string): Promise<ArticleListItem[]> =>
  apiFetch(category ? `/api/articles?category=${encodeURIComponent(category)}` : "/api/articles");
export const getArticle = (slug: string): Promise<ArticleDetail> =>
  apiFetch(`/api/articles/${slug}`);
