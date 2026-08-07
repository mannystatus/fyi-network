import Link from "next/link";
import type { Brand, ArticleListItem } from "../lib/api";
import { getArticles } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";
import ArticleList from "./ArticleList";
import EditorialHeader from "./EditorialHeader";
import EditorialFooter from "./EditorialFooter";
import EditorialNewsletterForm from "./EditorialNewsletterForm";

const NEWS_GRID_COUNT = 8;
const TOP_STORIES_COUNT = 3;
const RUMORS_COUNT = 5;
const ORIGINALS_COUNT = 6;

// PetaPixel-style mosaic card — same pattern as fyiCams' MosaicCard, reused
// here for the 6 brands sharing this template. Headline sits directly over
// the photo on a dark scrim instead of image-above/text-below; real-source
// attribution (see "Credit real sources on article cards") stays visible
// as a small caption under the headline.
function EditorialMosaicCard({
  article,
  size,
  brand,
}: {
  article: ArticleListItem;
  size: "large" | "small";
  brand: Brand;
}) {
  const source = article.author || brand.name;
  return (
    <Link className={`editorial-mosaic-card ${size}`} href={`/${article.slug}`} prefetch={false}>
      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt="" className="editorial-mosaic-img" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/icons/${brand.slug}-512.png`} alt="" className="editorial-mosaic-fallback" />
      )}
      <span className="editorial-mosaic-scrim" />
      {article.category && <span className="editorial-mosaic-cat">{article.category}</span>}
      <span className="editorial-mosaic-body">
        <h3>{article.title}</h3>
        {source && <span className="editorial-mosaic-source">fyi network · {source}</span>}
      </span>
    </Link>
  );
}

export default async function EditorialHomepage({
  brand,
  brands,
  config,
}: {
  brand: Brand;
  brands: Brand[];
  config: EditorialConfig;
}) {
  const [articles, rumors, originalsFetched] = await Promise.all([
    getArticles(undefined, NEWS_GRID_COUNT),
    config.rumorsTopic ? getArticles(config.rumorsTopic, RUMORS_COUNT) : Promise.resolve([]),
    getArticles(undefined, ORIGINALS_COUNT, undefined, undefined, true),
  ]);
  const topStories = articles.slice(0, TOP_STORIES_COUNT);
  const isSports = config.variant === "sports";
  // Hand-written pieces (is_featured) are otherwise sorted into the news
  // grid purely by publish date alongside auto-ingested wire content, so a
  // high-volume ingest day can push them off-page fast — this section
  // guarantees them a visible slot regardless. Dropping anything already
  // shown above avoids showing the same card twice on a slow news day.
  const shownSlugs = new Set(articles.map((a) => a.slug));
  const originals = originalsFetched.filter((a) => !shownSlugs.has(a.slug));

  return (
    // theme-<brand> matches the same class the shared #site.theme-<brand>
    // token rules key off — needed here too since this bespoke homepage
    // bypasses #site entirely (BARE_HOMEPAGE_BRANDS in template.tsx), so
    // those --editorial-* custom properties wouldn't otherwise be in scope.
    <div className={`editorial-homepage theme-${brand.icon}`} data-mode={config.mode}>
      <EditorialHeader brand={brand} brands={brands} config={config} />

      <main>
        <section className="editorial-section editorial-rule" id="news-grid">
          <div className="wrap">
            <div className="editorial-section-head">
              <h2>{config.newsGridTitle}</h2>
              <Link href="/news" prefetch={false}>
                {config.newsGridCta}
              </Link>
            </div>
            {articles.length > 0 ? (
              <>
                <div className="editorial-mosaic">
                  {articles.slice(0, 1).map((a) => (
                    <EditorialMosaicCard article={a} size="large" key={a.slug} brand={brand} />
                  ))}
                  {articles.length > 1 && (
                    <div className="editorial-mosaic-side">
                      {articles.slice(1, 3).map((a) => (
                        <EditorialMosaicCard article={a} size="small" key={a.slug} brand={brand} />
                      ))}
                    </div>
                  )}
                </div>
                {articles.length > 3 && (
                  <div className="editorial-story-list">
                    {articles.slice(3).map((a) => {
                      const source = a.author || brand.name;
                      return (
                        <Link className="editorial-story-row" href={`/${a.slug}`} key={a.slug} prefetch={false}>
                          <div className="editorial-story-row-thumb">
                            {a.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.image_url} alt="" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/icons/${brand.slug}-512.png`}
                                alt=""
                                className="editorial-story-row-fallback"
                              />
                            )}
                          </div>
                          <div>
                            <div className="editorial-story-eyebrow">
                              {a.category && <span className="cat">{a.category}</span>}
                              {a.category && <span>·</span>}
                              <span>
                                {new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              {source && (
                                <>
                                  <span>·</span>
                                  <span>fyi network · {source}</span>
                                </>
                              )}
                            </div>
                            <h3>{a.title}</h3>
                            {a.dek && <p>{a.dek}</p>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="editorial-empty">
                No posts yet — run `python -m app.ingest_news --brand {brand.slug}` to populate the feed.
              </p>
            )}
          </div>
        </section>

        {originals.length > 0 && (
          <section className="editorial-section editorial-band" id="from-us">
            <div className="wrap">
              <div className="editorial-section-head editorial-rule-inner">
                <h2>From {brand.name}</h2>
                <Link href="/from-us" prefetch={false}>
                  View all →
                </Link>
              </div>
              <ArticleList articles={originals} brandName={brand.name} brandSlug={brand.slug} emptyMessage="" />
            </div>
          </section>
        )}

        <section className="editorial-hero">
          <div className="wrap editorial-hero-grid">
            <div className="editorial-hero-left">
              <span className="editorial-eyebrow">
                <span className="editorial-eyebrow-dot" />
                {config.heroEyebrow}
              </span>
              <h1>
                {config.heroPre}
                <span className="editorial-accent">your</span>
                {config.heroPost}
              </h1>
              <p className="editorial-hero-dek">{config.heroDek}</p>
              <div className="editorial-hero-ctas">
                <Link className="editorial-cta-primary" href={articles[0] ? `/${articles[0].slug}` : "/"} prefetch={false}>
                  {config.heroCtaLabel ?? "Read today's roundup"}
                </Link>
                <a
                  className="editorial-cta-secondary"
                  href={config.rumorsTopic ? `/topics/${encodeURIComponent(config.rumorsTopic)}` : "#rumor-mill"}
                >
                  {config.navSecondaryLabel === "Renewal Tracker" ? "Renewal tracker" : "Rumors"} →
                </a>
              </div>
            </div>
            <div className="editorial-hero-right">
              <span className="editorial-top-stories-label">Top stories</span>
              {topStories.length > 0 ? (
                topStories.map((s) => (
                  <Link className="editorial-top-story-row" href={`/${s.slug}`} key={s.slug} prefetch={false}>
                    <span className="editorial-top-story-tag">{s.category || "Breaking"}</span>
                    <div className="editorial-top-story-title">{s.title}</div>
                  </Link>
                ))
              ) : (
                <p className="editorial-empty">No stories yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="editorial-section editorial-band" id="rumor-mill">
          <div className="wrap">
            <div className="editorial-section-head editorial-rule-inner">
              <h2>{config.secondarySectionTitle}</h2>
              {config.rumorsTopic ? (
                <Link href={`/topics/${encodeURIComponent(config.rumorsTopic)}`} prefetch={false}>
                  View all →
                </Link>
              ) : (
                <a href="#rumor-mill">{config.secondarySectionCta}</a>
              )}
            </div>
            {config.rumorsTopic ? (
              <ArticleList
                articles={rumors}
                brandName={brand.name}
                brandSlug={brand.slug}
                emptyMessage={`No ${config.rumorsTopic.toLowerCase()} coverage yet.`}
              />
            ) : (
              config.confidenceRows.map((r) => (
                <div className="editorial-confidence-row" key={r.title}>
                  <div>
                    <span className="editorial-confidence-label">
                      {r.label} · {r.pct}%
                    </span>
                    <div className="editorial-confidence-track">
                      <span className="editorial-confidence-fill" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                  <div>
                    <h4>{r.title}</h4>
                    <p>{r.dek}</p>
                  </div>
                  <span className="editorial-arrow">→</span>
                </div>
              ))
            )}
          </div>
        </section>

        {!isSports && config.showCompare && (
          <section className="editorial-section" id="compare">
            <div className="wrap">
              <div className="editorial-section-head">
                <h2>Quick compare</h2>
                <a href="#compare">Full comparison tool →</a>
              </div>
              <div className="editorial-compare-table">
                <div className="editorial-compare-th" />
                <div className="editorial-compare-th">{config.compareCol2Label}</div>
                <div className="editorial-compare-th">{config.compareCol3Label}</div>
                <div className="editorial-compare-th">Price</div>
                <div className="editorial-compare-th">Score</div>
                {config.compareRows.map((c) => (
                  <div className="editorial-compare-row" key={c.model}>
                    <div className="editorial-compare-cell model">{c.model}</div>
                    <div className="editorial-compare-cell">{c.col2}</div>
                    <div className="editorial-compare-cell">{c.col3}</div>
                    <div className="editorial-compare-cell">{c.price}</div>
                    <div className="editorial-compare-cell">
                      <span className="editorial-compare-score">{c.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!isSports && (
          <section className="editorial-section">
            <div className="wrap">
              <div className="editorial-section-head">
                <h2>{config.logTitle}</h2>
                <span className="editorial-log-sub">{config.logSubLabel}</span>
              </div>
              <div className="editorial-log-table">
                <div className="editorial-log-th">{config.logCol1Label}</div>
                <div className="editorial-log-th">{config.logCol2Label}</div>
                <div className="editorial-log-th">{config.showCompare ? "Released" : "Last update"}</div>
                <div className="editorial-log-th">Status</div>
                {config.logRows.map((u) => (
                  <div className="editorial-log-row" key={u.name}>
                    <div className="editorial-log-cell name">{u.name}</div>
                    <div className="editorial-log-cell mono">{u.col2}</div>
                    <div className="editorial-log-cell">{u.date}</div>
                    <div className="editorial-log-cell">
                      <span className="editorial-status-pill" style={{ background: u.statusColor }}>
                        {u.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!isSports && (
          <section className="editorial-roadmap-band">
            <div className="wrap">
              <div className="editorial-section-head">
                <h2>{config.roadmapTitle}</h2>
                <a href="#news-grid">{config.roadmapCta}</a>
              </div>
              <div className="editorial-roadmap-grid">
                {config.roadmapRows.map((r) => (
                  <div className="editorial-roadmap-cell" key={r.window}>
                    <div className="editorial-roadmap-window">{r.window}</div>
                    <div className="editorial-roadmap-product">{r.product}</div>
                    <div className="editorial-roadmap-confidence">
                      {r.confidence}
                      {config.roadmapConfidenceSuffix ? " confidence" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {isSports && (
          <section className="editorial-section" id="fantasy">
            <div className="wrap">
              <div className="editorial-section-head">
                <h2>Fantasy corner · {config.fantasyLabel}</h2>
                <a href="#fantasy">Full rankings →</a>
              </div>
              <div className="editorial-fantasy-grid">
                <div className="editorial-fantasy-col start">
                  <h3>Start</h3>
                  {config.fantasyStart?.map((p) => (
                    <div className="editorial-fantasy-row" key={p.name}>
                      <span>
                        {p.name} <span className="editorial-fantasy-pos">· {p.pos}</span>
                      </span>
                      <span className="editorial-fantasy-note">{p.note}</span>
                    </div>
                  ))}
                </div>
                <div className="editorial-fantasy-col sit">
                  <h3>Sit</h3>
                  {config.fantasySit?.map((p) => (
                    <div className="editorial-fantasy-row" key={p.name}>
                      <span>
                        {p.name} <span className="editorial-fantasy-pos">· {p.pos}</span>
                      </span>
                      <span className="editorial-fantasy-note">{p.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {isSports && (
          <section className="editorial-section" id="injury-report">
            <div className="wrap">
              <div className="editorial-section-head">
                <h2>Injury report</h2>
                <span className="editorial-log-sub">{config.injuryUpdatedLabel}</span>
              </div>
              <div className="editorial-injury-table">
                <div className="editorial-log-th">Player</div>
                <div className="editorial-log-th">Injury</div>
                <div className="editorial-log-th">Practice</div>
                <div className="editorial-log-th">Game status</div>
                {config.injuryRows?.map((i) => (
                  <div className="editorial-log-row" key={i.name}>
                    <div className="editorial-log-cell name">
                      {i.name} <span className="editorial-fantasy-pos">· {i.pos}</span>
                    </div>
                    <div className="editorial-log-cell">{i.injury}</div>
                    <div className="editorial-log-cell mono">{i.practice}</div>
                    <div className="editorial-log-cell">
                      <span className="editorial-status-pill" style={{ background: i.statusColor }}>
                        {i.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="wrap editorial-newsletter-wrap" id="newsletter">
          <div className="editorial-newsletter-band">
            <div>
              <h2>{isSports ? "Get the gameday brief" : "Get the morning roundup"}</h2>
              <p>
                {isSports
                  ? "One email, every gameday morning. Rotation news, minutes notes, fantasy angles."
                  : "One email, every weekday. Verified rumors, none of the noise."}
              </p>
            </div>
            <EditorialNewsletterForm brandSlug={brand.slug} />
          </div>
        </div>
      </main>

      <EditorialFooter brand={brand} brands={brands} config={config} />
    </div>
  );
}
