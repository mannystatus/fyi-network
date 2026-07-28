import type { Metadata } from "next";
import { getArticles, getAllBrands, getCurrentBrand } from "../lib/api";
import ArticleList from "../components/ArticleList";
import FlyNowHomepage from "../components/FlyNowHomepage";
import LatestFromUs from "../components/LatestFromUs";
import Pagination from "../components/Pagination";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const brand = await getCurrentBrand();

  if (brand.icon === "flynow") {
    const brands = await getAllBrands();
    return <FlyNowHomepage brands={brands} currentSlug={brand.slug} />;
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch one extra to know whether an "Older" page actually exists,
  // without needing a separate COUNT query.
  const fetched = await getArticles(undefined, PAGE_SIZE + 1, offset);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      {page === 1 && <LatestFromUs variant="top" />}
      <p className="section-label">Latest</p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        emptyMessage={
          page > 1
            ? "Nothing here — go back to page 1."
            : "No articles yet — run `python -m app.ingest_news --all-brands` to populate the feed."
        }
      />
      <Pagination page={page} hasMore={hasMore} basePath="/" />
    </>
  );
}
