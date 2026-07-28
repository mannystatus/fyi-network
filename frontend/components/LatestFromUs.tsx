import { getArticles } from "../lib/api";
import ArticleList from "./ArticleList";

const COUNT = 5;

/** Footer discovery section for pages that aren't already showing the latest feed (e.g. the homepage). */
export default async function LatestFromUs({ excludeSlug }: { excludeSlug?: string }) {
  const fetched = await getArticles(undefined, excludeSlug ? COUNT + 1 : COUNT);
  const articles = fetched.filter((a) => a.slug !== excludeSlug).slice(0, COUNT);

  if (articles.length === 0) return null;

  return (
    <div className="latest-from-us">
      <p className="section-label">Latest from us</p>
      <ArticleList articles={articles} emptyMessage="" />
    </div>
  );
}
