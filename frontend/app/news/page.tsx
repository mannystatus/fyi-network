import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getCurrentBrand } from "../../lib/api";
import ArticleList from "../../components/ArticleList";
import Pagination from "../../components/Pagination";
import { buildKeywords } from "../../lib/seo";

// The bespoke per-brand homepages (EditorialHomepage/CamsHomepage) only ever
// show a curated handful of articles — this is the actual "browse
// everything" page their nav "News" link and "View all" CTAs point to.
const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  const title = "Latest News";
  const description = `Every story from ${brand.name}, most recent first.`;

  return {
    title,
    description,
    keywords: buildKeywords(brand, ["news", "latest news"]),
    alternates: { canonical: "/news" },
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [fetched, brand] = await Promise.all([getArticles(undefined, PAGE_SIZE + 1, offset), getCurrentBrand()]);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; News
      </p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        brandSlug={brand.slug}
        emptyMessage={page > 1 ? "Nothing here — go back to page 1." : "No articles yet."}
      />
      <Pagination page={page} hasMore={hasMore} basePath="/news" />
    </>
  );
}
