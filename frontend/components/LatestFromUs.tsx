import { getArticles, getCurrentBrand } from "../lib/api";
import ArticleList from "./ArticleList";

const COUNT = 5;

/** Discovery section pointing to the newest articles — shown at the top of the homepage, and at the bottom of every other page. */
export default async function LatestFromUs({
  excludeSlug,
  variant = "footer",
}: {
  excludeSlug?: string;
  variant?: "footer" | "top";
}) {
  const [fetched, brand] = await Promise.all([
    getArticles(undefined, excludeSlug ? COUNT + 1 : COUNT, undefined, undefined, true),
    getCurrentBrand(),
  ]);
  const articles = fetched.filter((a) => a.slug !== excludeSlug).slice(0, COUNT);

  if (articles.length === 0) return null;

  return (
    <div className={`latest-from-us latest-from-us--${variant}`}>
      <p className="section-label">Latest from us</p>
      <ArticleList articles={articles} emptyMessage="" brandName={brand.name} />
    </div>
  );
}
