import Link from "next/link";
import type { Brand } from "../lib/api";
import { getArticles } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";
import EditorialHeader from "./EditorialHeader";
import EditorialFooter from "./EditorialFooter";
import EditorialNewsletterForm from "./EditorialNewsletterForm";
import LakersScoreboard from "./LakersScoreboard";
import DodgersScoreboard from "./DodgersScoreboard";
import GameDaySoftPrompt from "./GameDaySoftPrompt";

const NEWS_GRID_COUNT = 8;
const TOP_STORIES_COUNT = 3;

export default async function EditorialHomepage({
  brand,
  brands,
  config,
}: {
  brand: Brand;
  brands: Brand[];
  config: EditorialConfig;
}) {
  const articles = await getArticles(undefined, NEWS_GRID_COUNT);
  const topStories = articles.slice(0, TOP_STORIES_COUNT);
  const isSports = config.variant === "sports";

  return (
    // theme-<brand> matches the same class the shared #site.theme-<brand>
    // token rules key off — needed here too since this bespoke homepage
    // bypasses #site entirely (BARE_HOMEPAGE_BRANDS in template.tsx), so
    // those --editorial-* custom properties wouldn't otherwise be in scope.
    <div className={`editorial-homepage theme-${brand.icon}`} data-mode={config.mode}>
      <EditorialHeader brand={brand} brands={brands} config={config} />

      <main>
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
                <a className="editorial-cta-secondary" href="#rumor-mill">
                  {config.navSecondaryLabel === "Renewal Tracker" ? "Renewal tracker" : "Rumor mill"} →
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

        {/* Real live-data scoreboard (ESPN schedule fetch + 30s live-score
            polling + SportsEvent JSON-LD) instead of a hardcoded "Upcoming
            schedule" band — the mockup's version would just be fake data
            duplicating what this already does for real. */}
        {isSports && (
          <section className="editorial-section editorial-rule editorial-scoreboard-section" id="scoreboard">
            <div className="wrap">
              {config.scoreboardBrand === "lakers" && <LakersScoreboard />}
              {config.scoreboardBrand === "dodgers" && <DodgersScoreboard />}
            </div>
          </section>
        )}

        <section className="editorial-section editorial-rule" id="news-grid">
          <div className="wrap">
            <div className="editorial-section-head">
              <h2>{config.newsGridTitle}</h2>
              <Link href="/" prefetch={false}>
                {config.newsGridCta}
              </Link>
            </div>
            {articles.length > 0 ? (
              <div className="editorial-news-grid">
                {articles.map((a) => (
                  <Link className="editorial-news-card" href={`/${a.slug}`} key={a.slug} prefetch={false}>
                    <div className="editorial-news-thumb" style={{ aspectRatio: config.posterAspect }}>
                      {a.category && <span className="editorial-news-cat">{a.category}</span>}
                    </div>
                    <h3>{a.title}</h3>
                    {a.dek && <p>{a.dek}</p>}
                    <span className="editorial-news-meta">
                      {new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="editorial-empty">
                No posts yet — run `python -m app.ingest_news --brand {brand.slug}` to populate the feed.
              </p>
            )}
          </div>
        </section>

        <section className="editorial-section editorial-band" id="rumor-mill">
          <div className="wrap">
            <div className="editorial-section-head editorial-rule-inner">
              <h2>{config.secondarySectionTitle}</h2>
              <a href="#rumor-mill">{config.secondarySectionCta}</a>
            </div>
            {config.confidenceRows.map((r) => (
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
            ))}
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

        {isSports && <GameDaySoftPrompt brandSlug={brand.slug} teamName={config.gameDayTeamName ?? brand.name} />}

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
            <EditorialNewsletterForm />
          </div>
        </div>
      </main>

      <EditorialFooter brand={brand} config={config} />
    </div>
  );
}
