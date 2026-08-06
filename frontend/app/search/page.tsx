import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getCurrentBrand } from "../../lib/api";
import ArticleList from "../../components/ArticleList";
import LatestFromUs from "../../components/LatestFromUs";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 20;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const brand = await getCurrentBrand();
  const query = (q || "").trim();
  return {
    title: query ? `Search: ${query}` : "Search",
    description: query ? `Search results for "${query}" on ${brand.name}.` : `Search ${brand.name} articles.`,
    // Internal search-result pages are thin, near-duplicate content that
    // Google explicitly advises against indexing — noindex keeps them out
    // of search entirely rather than diluting the site's real pages, while
    // `follow` still lets crawlers reach whatever articles they link to.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q || "").trim();
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const brand = await getCurrentBrand();

  if (!query) {
    return (
      <>
        <p className="section-label">
          <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; Search
        </p>
        <p style={{ color: "var(--comment)" }}>Type something in the search box above to find an article.</p>
        <LatestFromUs />
      </>
    );
  }

  const fetched = await getArticles(undefined, PAGE_SIZE + 1, offset, query);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; Search: &ldquo;{query}&rdquo;
      </p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        brandSlug={brand.slug}
        emptyMessage={`No articles found for "${query}".`}
      />
      <Pagination page={page} hasMore={hasMore} basePath="/search" query={query} />
      <LatestFromUs />
    </>
  );
}
