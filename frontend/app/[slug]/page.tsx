import Link from "next/link";
import { getArticle } from "../../lib/api";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>
      {article.category && <span className="category">{article.category}</span>}
      <h1 style={{ margin: "8px 0", fontSize: 26, color: "var(--fg)", fontWeight: 400 }}>
        {article.title}
      </h1>
      {article.dek && <p style={{ color: "var(--comment)" }}>{article.dek}</p>}
      <div className="article-meta" style={{ marginBottom: 24 }}>
        {article.author}
        {article.author && " · "}
        {new Date(article.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      {/* body_md is markdown — swap in your renderer of choice (e.g. react-markdown) */}
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{article.body_md}</div>
    </article>
  );
}
