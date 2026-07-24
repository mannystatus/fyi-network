import { Fragment } from "react";
import Link from "next/link";
import type { ArticleListItem } from "../lib/api";
import { categoryColor } from "../lib/colors";
import { AD_SLOTS } from "../lib/analytics";
import AdSlot from "./AdSlot";

// One in-feed ad per screenful is the AdSense-recommended density — much
// more frequent than this starts tripping "low value content" review flags.
const IN_FEED_INTERVAL = 6;

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
      {articles.map((a, i) => (
        <Fragment key={a.slug}>
          <Link href={`/${a.slug}`} className="article-card">
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
          {i > 0 && (i + 1) % IN_FEED_INTERVAL === 0 && (
            <AdSlot slot={AD_SLOTS.inFeed} layoutKey={AD_SLOTS.inFeedLayoutKey} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
