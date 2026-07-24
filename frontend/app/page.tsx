import type { Metadata } from "next";
import { getArticles } from "../lib/api";
import ArticleList from "../components/ArticleList";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
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
