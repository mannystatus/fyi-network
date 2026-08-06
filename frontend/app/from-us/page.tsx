import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getCurrentBrand } from "../../lib/api";
import ArticleList from "../../components/ArticleList";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  const title = `Latest from ${brand.name}`;
  const description = `${brand.name}'s own original reporting — hand-written by our team, not aggregated from other outlets.`;

  return {
    title,
    description,
    alternates: { canonical: "/from-us" },
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}

// Everything else on the site (the homepage grids, /topics, /search) mixes
// in automated RSS briefs from outside outlets alongside our own writing —
// this is the one place that's exclusively the latter (featured_only, see
// routers/articles.py), so readers who want to know what's actually ours
// have somewhere to go. Linked from the nav on every brand (see
// EditorialHeader/CamsHeader/FlyNowNavbar's "Latest from {brand}" link).
export default async function FromUsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [fetched, brand] = await Promise.all([
    getArticles(undefined, PAGE_SIZE + 1, offset, undefined, true),
    getCurrentBrand(),
  ]);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; Latest from {brand.name}
      </p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        brandSlug={brand.slug}
        emptyMessage={
          page > 1
            ? "Nothing here — go back to page 1."
            : `No original ${brand.name} stories published yet.`
        }
      />
      <Pagination page={page} hasMore={hasMore} basePath="/from-us" />
    </>
  );
}
