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
  icon: "mac" | "win" | "google" | "netflix" | "flynow" | "lakers" | "dodgers";
  topics: string[];
};

export type ArticleListItem = {
  slug: string;
  category: string | null;
  title: string;
  dek: string | null;
  author: string | null;
  published_at: string;
  is_featured: boolean;
};

export type ArticleDetail = ArticleListItem & { body_md: string };

export const getCurrentBrand = (): Promise<Brand> => apiFetch("/api/brands/current");
export const getAllBrands = (): Promise<Brand[]> => apiFetch("/api/brands");
export const getArticles = (
  category?: string,
  limit?: number,
  offset?: number,
  q?: string
): Promise<ArticleListItem[]> => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  if (q) params.set("q", q);
  const qs = params.toString();
  return apiFetch(qs ? `/api/articles?${qs}` : "/api/articles");
};
export const getArticle = (slug: string): Promise<ArticleDetail> =>
  apiFetch(`/api/articles/${slug}`);
