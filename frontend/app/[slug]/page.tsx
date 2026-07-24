import Link from "next/link";
import ReactMarkdown from "react-markdown";
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

      <div className="article-header">
        {article.category && <span className="category">{article.category}</span>}
        <h1 className="article-title">{article.title}</h1>
        {article.dek && <p className="article-dek">{article.dek}</p>}
        <div className="article-meta">
          {article.author}
          {article.author && " · "}
          {new Date(article.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="article-body">
        <ReactMarkdown>{article.body_md}</ReactMarkdown>
      </div>
    </article>
  );
}
