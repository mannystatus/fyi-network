import { getArticles } from "../lib/api";
import ArticleList from "../components/ArticleList";

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <>
      <p className="section-label">Latest</p>
      <ArticleList
        articles={articles}
        emptyMessage="No articles yet — run the seed script, or publish your first post."
      />
    </>
  );
}
