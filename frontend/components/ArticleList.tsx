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
  brandName,
  brandSlug,
}: {
  articles: ArticleListItem[];
  emptyMessage: string;
  /** Fallback byline for articles with no author set. */
  brandName?: string;
  /** Used for the /icons/{brandSlug}-512.png fallback thumbnail on articles with no image. */
  brandSlug: string;
}) {
  if (articles.length === 0) {
    return <p style={{ color: "var(--comment)" }}>{emptyMessage}</p>;
  }

  return (
    <div>
      {articles.map((a, i) => {
        const byline = a.author || brandName;
        return (
          <Fragment key={a.slug}>
            <Link
              href={`/${a.slug}`}
              className="article-card"
              data-featured={a.is_featured || undefined}
              data-has-thumb="true"
              prefetch={false}
            >
              <div className="article-card-thumb" data-fallback={a.image_url ? undefined : "true"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url || `/icons/${brandSlug}-512.png`} alt="" />
              </div>
              <div className="article-card-body">
                {a.is_featured && <span className="featured-badge">★ Featured</span>}
                <div className="article-card-tags">
                  <span className="fyi-badge">fyi network{byline ? ` · ${byline}` : ""}</span>
                  {a.category && (
                    <span className="category" style={{ color: categoryColor(a.category) }}>
                      {a.category}
                    </span>
                  )}
                </div>
                <h2>{a.title}</h2>
                {a.dek && <p>{a.dek}</p>}
                <div className="article-meta">
                  {byline}
                  {byline && " · "}
                  {new Date(a.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </Link>
            {i > 0 && (i + 1) % IN_FEED_INTERVAL === 0 && (
              <AdSlot slot={AD_SLOTS.inFeed} layoutKey={AD_SLOTS.inFeedLayoutKey} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
