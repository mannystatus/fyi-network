import Link from "next/link";
import type { ArticleListItem } from "../lib/api";
import { categoryColor } from "../lib/colors";

export default function ArticleList({
  articles,
  emptyMessage,
}: {
  articles: ArticleListItem[];
  emptyMessage: string;
}) {
  if (articles.length === 0) {
    return <p style={{ color: "var(--comment)" }}>{emptyMessage}</p>;
  }

  return (
    <div>
      {articles.map((a) => (
        <Link key={a.slug} href={`/${a.slug}`} className="article-card">
          {a.category && (
            <span className="category" style={{ color: categoryColor(a.category) }}>
              {a.category}
            </span>
          )}
          <h2>{a.title}</h2>
          {a.dek && <p>{a.dek}</p>}
          <div className="article-meta">
            {a.author}
            {a.author && " · "}
            {new Date(a.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
