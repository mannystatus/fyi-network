import Link from "next/link";
import { getArticles } from "../lib/api";

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <>
      <p className="section-label">Latest</p>
      <div>
        {articles.length === 0 && (
          <p style={{ color: "var(--comment)" }}>
            No articles yet — run the seed script, or publish your first post.
          </p>
        )}
        {articles.map((a) => (
          <Link key={a.slug} href={`/${a.slug}`} className="article-card">
            {a.category && <span className="category">{a.category}</span>}
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
    </>
  );
}
