import type { Metadata } from "next";
import { getArticles, getAllBrands, getCurrentBrand } from "../lib/api";
import ArticleList from "../components/ArticleList";
import FlyNowHomepage from "../components/FlyNowHomepage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const brand = await getCurrentBrand();

  if (brand.icon === "flynow") {
    const brands = await getAllBrands();
    return <FlyNowHomepage brands={brands} currentSlug={brand.slug} />;
  }

  const articles = await getArticles();

  return (
    <>
      <p className="section-label">Latest</p>
      <ArticleList
        articles={articles}
        emptyMessage="No articles yet — run `python -m app.ingest_news --all-brands` to populate the feed."
      />
    </>
  );
}
