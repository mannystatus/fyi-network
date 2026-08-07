import Link from "next/link";
import type { Brand, ArticleListItem } from "../lib/api";
import { getArticles } from "../lib/api";
import CamsHeader from "./CamsHeader";
import CamsFooter from "./CamsFooter";
import CamsNewsletterForm from "./CamsNewsletterForm";
import SendTipForm from "./SendTipForm";
import { CAMS_REVIEWS } from "../lib/camsReviews";
import { COMPARE_ROWS, DEALS } from "../lib/camsHomeContent";

const LATEST_COUNT = 8;
const RUMOR_COUNT = 5;

function scoreColor(score: number) {
  return score >= 8.5 ? "#0B5E52" : "#C6841F";
}

// PetaPixel-style mosaic card: headline set directly over the photo on a
// dark scrim, rather than image-above/text-below — used for the top 3
// "Latest stories" (one large + two stacked). Real-source attribution
// (see the "Credit real sources on article cards" commit) stays visible
// as a small caption under the headline, same info the old fyi-badge
// pill carried, just restyled to sit on the image instead of below it.
function MosaicCard({ article, size, brand }: { article: ArticleListItem; size: "large" | "small"; brand: Brand }) {
  const review = CAMS_REVIEWS[article.slug];
  const source = article.is_featured ? brand.name : article.author;
  return (
    <Link className={`cams-mosaic-card ${size}`} href={`/${article.slug}`} prefetch={false}>
      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt="" className="cams-mosaic-img" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/icons/${brand.slug}-512.png`} alt="" className="cams-mosaic-fallback" />
      )}
      <span className="cams-mosaic-scrim" />
      {article.category && <span className="cams-mosaic-cat">{article.category}</span>}
      {review && (
        <span className="cams-mosaic-score">
          {review.verdictLabel === "Coming Soon" ? "—" : review.score.toFixed(1)}
        </span>
      )}
      <span className="cams-mosaic-body">
        <h3>{article.title}</h3>
        {source && <span className="cams-mosaic-source">fyi network · {source}</span>}
      </span>
    </Link>
  );
}

export default async function CamsHomepage({ brand, brands }: { brand: Brand; brands: Brand[] }) {
  const [latest, reviews, rumors] = await Promise.all([
    getArticles(undefined, LATEST_COUNT),
    Promise.resolve(Object.values(CAMS_REVIEWS)),
    getArticles("Rumors", RUMOR_COUNT),
  ]);
  const leadReview = reviews[0];

  return (
    <div className="cams-homepage">
      <style>{`
    .cams-homepage :where(h1, h2, h3, h4, h5, p, ul, li, form, button) { margin: 0; padding: 0; }
    .cams-homepage a { color: inherit; text-decoration: none; }
    .cams-homepage .wrap { max-width: 1240px; margin: 0 auto; padding: 0 32px; }

    /* ---------- HERO ---------- */
    .cams-hero { border-bottom: 2px solid #14120F; }
    .cams-hero-grid { padding: 64px 0 56px; display: grid; grid-template-columns: 1.35fr .65fr; gap: 0; }
    @media (max-width: 900px) { .cams-hero-grid { grid-template-columns: 1fr; } }
    .cams-hero-left { border-right: 1px solid #E0DCD3; padding-right: 48px; }
    @media (max-width: 900px) { .cams-hero-left { border-right: none; padding-right: 0; } }
    .cams-hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-cams-mono), monospace;
      font-size: .72rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #0B5E52;
      background: rgba(11,94,82,.08); padding: 6px 12px; margin-bottom: 24px;
    }
    .cams-hero-eyebrow-dot { width: 6px; height: 6px; background: #D9A23B; }
    .cams-hero h1 {
      font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700;
      font-size: clamp(2.2rem, 4vw, 3.4rem); line-height: 1.08; letter-spacing: -.015em; margin-bottom: 22px;
    }
    .cams-hero h1 em { font-style: italic; color: #0B5E52; }
    .cams-hero-dek { font-size: 1.05rem; color: #4A463F; max-width: 52ch; margin-bottom: 30px; line-height: 1.6; }
    .cams-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
    .cams-hero-cta-primary {
      background: #14120F; color: #F7F5F1; padding: 14px 24px; border-radius: 3px; font-weight: 700;
      font-size: .9rem; border: none;
    }
    .cams-hero-cta-secondary {
      padding: 14px 22px; border-radius: 3px; font-weight: 700; font-size: .9rem; border: 1px solid #14120F;
      background: transparent;
    }
    .cams-hero-right { padding-left: 48px; display: flex; flex-direction: column; gap: 22px; justify-content: center; }
    @media (max-width: 900px) { .cams-hero-right { padding-left: 0; margin-top: 32px; } }
    .cams-scores-label {
      font-family: var(--font-cams-mono), monospace; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase;
      color: #8C8779; font-weight: 600;
    }
    .cams-score-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #E0DCD3; }
    /* Squared-off score tag, not a circular "badge" — DPReview's spec-sheet
       convention (a scored value reads as data, not a medal). */
    .cams-score-badge {
      min-width: 46px; height: 34px; padding: 0 8px; border-radius: 3px; color: #F7F5F1; display: flex; align-items: center;
      justify-content: center; font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: .92rem;
      flex-shrink: 0;
    }
    .cams-score-title { font-size: .92rem; font-weight: 600; line-height: 1.3; }
    .cams-scores-empty { font-size: .85rem; color: #8C8779; padding: 14px 0; }

    /* ---------- COMPARE STRIP ---------- */
    /* DPReview's spec-table convention: real grid lines (not just row
       rules), a tinted header row, and a hover-highlight on each spec
       row — reads as data to be scanned/compared, not just a list. */
    .cams-compare { background: #14120F; color: #F7F5F1; padding: 40px 0; }
    .cams-compare-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; }
    .cams-compare-head h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.4rem; color: #fff; }
    .cams-compare-table { display: grid; grid-template-columns: 1.2fr repeat(4,1fr); border: 1px solid rgba(247,245,241,.15); }
    @media (max-width: 700px) { .cams-compare-table { grid-template-columns: 1fr; border: none; } }
    .cams-compare-th {
      padding: 12px 0; font-family: var(--font-cams-mono), monospace; font-size: .66rem; text-transform: uppercase;
      letter-spacing: .1em; color: #D9A23B; font-weight: 700; text-align: center; background: rgba(217,162,59,.08);
      border-left: 1px solid rgba(247,245,241,.15);
    }
    .cams-compare-th:first-child { text-align: left; padding-left: 4px; border-left: none; }
    @media (max-width: 700px) { .cams-compare-th { display: none; } }
    .cams-compare-row { display: contents; }
    @media (max-width: 700px) { .cams-compare-row { display: block; border-top: 1px solid rgba(247,245,241,.15); padding: 12px 0; } }
    .cams-compare-row:hover .cams-compare-cell { background: rgba(247,245,241,.04); }
    .cams-compare-cell {
      padding: 14px 0; border-top: 1px solid rgba(247,245,241,.15); border-left: 1px solid rgba(247,245,241,.15);
      text-align: center; font-family: var(--font-cams-mono), monospace; font-size: .84rem; color: #D9D5CB;
      transition: background .1s ease;
    }
    .cams-compare-cell:first-child { border-left: none; padding-left: 4px; }
    @media (max-width: 700px) { .cams-compare-cell { border-top: none; border-left: none; padding: 3px 0; text-align: left; } }
    .cams-compare-cell.model { text-align: left; font-family: inherit; font-weight: 600; font-size: .9rem; color: #fff; }
    .cams-compare-score { background: #3FBFA8; color: #14120F; font-weight: 700; padding: 3px 9px; border-radius: 3px; }

    /* ---------- SECTIONS ---------- */
    .cams-section { padding: 60px 0; }
    .cams-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 30px; }
    .cams-section-head h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.6rem; }
    .cams-section-head a { font-size: .85rem; font-weight: 700; color: #0B5E52; }
    .cams-rule { border-bottom: 2px solid #14120F; }
    .cams-rule .cams-section-head { padding-bottom: 16px; border-bottom: 2px solid #14120F; margin-bottom: 34px; }

    /* ---------- LATEST STORIES ---------- */
    /* Photo-mosaic lead (PetaPixel's hero grid: one large card + two
       stacked smaller ones, headline set directly over the image on a
       dark scrim) followed by a plain divided list for the rest
       (PetaPixel's "THE LATEST" list: thin rules, small square thumb,
       an eyebrow meta row above the headline) — DPReview's contribution
       is the score badge on each card staying a bold squared-off tag
       rather than a soft circle, matching its spec-sheet aesthetic. */
    .cams-mosaic { display: grid; grid-template-columns: 1.6fr 1fr; gap: 4px; margin-bottom: 4px; }
    @media (max-width: 900px) { .cams-mosaic { grid-template-columns: 1fr; } }
    .cams-mosaic-side { display: flex; flex-direction: column; gap: 4px; }
    .cams-mosaic-card {
      position: relative; display: block; overflow: hidden; background: #14120F;
    }
    .cams-mosaic-card.large { aspect-ratio: 5 / 4; }
    .cams-mosaic-card.small { flex: 1; min-height: 160px; }
    .cams-mosaic-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
    .cams-mosaic-card:hover .cams-mosaic-img { transform: scale(1.03); }
    .cams-mosaic-fallback {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 30%; max-width: 96px; height: auto; opacity: .7;
    }
    .cams-mosaic-scrim {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(20,18,15,.93) 0%, rgba(20,18,15,.6) 38%, rgba(20,18,15,0) 68%);
    }
    .cams-mosaic-cat {
      position: absolute; top: 14px; left: 14px; background: #0B5E52; color: #F7F5F1; padding: 5px 10px;
      font-family: var(--font-cams-mono), monospace; font-size: .64rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    }
    .cams-mosaic-score {
      position: absolute; top: 14px; right: 14px; background: #D9A23B; color: #14120F; padding: 5px 9px;
      font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: .74rem;
    }
    .cams-mosaic-body { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 20px; }
    .cams-mosaic-body h3 {
      font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; color: #fff; line-height: 1.22;
      font-size: 1.06rem;
    }
    .cams-mosaic-card.large .cams-mosaic-body h3 { font-size: clamp(1.3rem, 2.1vw, 1.8rem); }
    .cams-mosaic-source { display: block; margin-top: 8px; font-family: var(--font-cams-mono), monospace; font-size: .68rem; color: #CFC9BC; }

    .cams-story-list { border-top: 1px solid #E0DCD3; }
    .cams-story-row { display: grid; grid-template-columns: 108px 1fr; gap: 20px; padding: 22px 0; border-bottom: 1px solid #E0DCD3; }
    @media (max-width: 560px) { .cams-story-row { grid-template-columns: 1fr; } }
    .cams-story-row-thumb {
      position: relative; aspect-ratio: 1 / 1; overflow: hidden; background: repeating-linear-gradient(45deg,#EDE9E2,#EDE9E2 10px,#E4E0D6 10px,#E4E0D6 20px);
    }
    .cams-story-row-fallback {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 42% !important; height: 42% !important; object-fit: contain; opacity: .75;
    }
    .cams-story-row-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .cams-story-eyebrow {
      display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-family: var(--font-cams-mono), monospace;
      font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: #8C8779; font-weight: 700; margin-bottom: 6px;
    }
    .cams-story-eyebrow .cat { color: #0B5E52; }
    .cams-story-row h3 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.08rem; line-height: 1.3; color: #14120F; margin-bottom: 6px; }
    .cams-story-row p { font-size: .86rem; color: #4A463F; }
    .cams-empty { color: #8C8779; font-size: .9rem; }

    /* ---------- RUMOR MILL ---------- */
    .cams-rumor-row { display: grid; grid-template-columns: 130px 1fr auto; gap: 24px; align-items: center; padding: 22px 0; border-bottom: 1px solid #E0DCD3; }
    @media (max-width: 700px) { .cams-rumor-row { grid-template-columns: 1fr; gap: 8px; } }
    .cams-rumor-row:hover { background: rgba(20,18,15,.03); }
    .cams-rumor-date { font-family: var(--font-cams-mono), monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; font-weight: 700; }
    .cams-rumor-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .cams-rumor-dek { font-size: .85rem; color: #4A463F; }
    .cams-rumor-source { font-size: .78rem; color: #8C8779; margin-top: 4px; display: block; }
    .cams-rumor-arrow { color: #0B5E52; font-size: 1.3rem; }
    .cams-rumor-empty { padding: 22px 0; font-size: .9rem; color: #8C8779; }

    /* ---------- DEALS ---------- */
    .cams-deals-note { font-family: var(--font-cams-mono), monospace; font-size: .64rem; color: #8C8779; }
    .cams-deal-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    @media (max-width: 800px) { .cams-deal-grid { grid-template-columns: 1fr; } }
    .cams-deal-card { border: 1px solid #E0DCD3; padding: 20px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit; transition: border-color .15s ease; }
    .cams-deal-card:hover { border-color: #0B5E52; }
    .cams-deal-tag { align-self: flex-start; background: #0B5E52; color: #F7F5F1; font-family: var(--font-cams-mono), monospace; font-size: .68rem; font-weight: 700; padding: 3px 8px; }
    .cams-deal-price { font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: 1.15rem; }
    .cams-deal-note { font-size: .82rem; color: #4A463F; line-height: 1.4; }
    .cams-deal-cta { font-family: var(--font-cams-mono), monospace; font-size: .74rem; font-weight: 700; color: #0B5E52; margin-top: auto; }

    /* ---------- PODCAST / COMMUNITY ---------- */
    .cams-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 700px) { .cams-two-col { grid-template-columns: 1fr; } }
    .cams-info-card { border: 1px solid #E0DCD3; padding: 28px; display: flex; flex-direction: column; gap: 10px; }
    .cams-info-eyebrow { font-family: var(--font-cams-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; font-weight: 700; }
    .cams-coming-soon-badge { display: inline-block; margin-left: 8px; padding: 2px 8px; background: #B3261E; color: #F7F5F1; border-radius: 3px; letter-spacing: .06em; }
    .cams-info-card h4 { font-family: var(--font-cams-display), Newsreader, serif; font-size: 1.2rem; font-weight: 700; }
    .cams-info-card p { font-size: .86rem; color: #4A463F; }
    .cams-info-card a { font-size: .84rem; font-weight: 700; color: #0B5E52; }

    /* ---------- NEWSLETTER ---------- */
    .cams-newsletter-band { background: #0A4A40; color: #F7F5F1; padding: 52px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
    @media (max-width: 700px) { .cams-newsletter-band { grid-template-columns: 1fr; padding: 36px 24px; } }
    .cams-newsletter-band h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.7rem; color: #fff; margin-bottom: 10px; }
    .cams-newsletter-band p { color: #CFE3DF; font-size: .96rem; max-width: 44ch; }
    .cams-newsletter-form { display: flex; flex-wrap: wrap; gap: 10px; }
    .cams-newsletter-form input { flex: 1; padding: 13px 16px; border: none; font-size: .92rem; font-family: var(--font-cams-body), sans-serif; }
    .cams-newsletter-form button { background: #D9A23B; color: #14120F; border: none; padding: 13px 22px; font-weight: 700; font-size: .9rem; cursor: pointer; }
    .cams-newsletter-form button:disabled { opacity: .7; cursor: default; }
      `}</style>

      <CamsHeader brand={brand} brands={brands} />

      <main>
        <section className="cams-section cams-rule">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Latest stories</h2>
              <Link href="/reviews" prefetch={false}>
                View all →
              </Link>
            </div>
            {latest.length > 0 ? (
              <>
                <div className="cams-mosaic">
                  {latest.slice(0, 1).map((a) => (
                    <MosaicCard article={a} size="large" key={a.slug} brand={brand} />
                  ))}
                  {latest.length > 1 && (
                    <div className="cams-mosaic-side">
                      {latest.slice(1, 3).map((a) => (
                        <MosaicCard article={a} size="small" key={a.slug} brand={brand} />
                      ))}
                    </div>
                  )}
                </div>
                {latest.length > 3 && (
                  <div className="cams-story-list">
                    {latest.slice(3).map((a) => {
                      const source = a.is_featured ? brand.name : a.author;
                      return (
                        <Link className="cams-story-row" href={`/${a.slug}`} key={a.slug} prefetch={false}>
                          <div className="cams-story-row-thumb">
                            {a.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.image_url} alt="" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={`/icons/${brand.slug}-512.png`} alt="" className="cams-story-row-fallback" />
                            )}
                          </div>
                          <div>
                            <div className="cams-story-eyebrow">
                              {a.category && <span className="cat">{a.category}</span>}
                              {a.category && <span>·</span>}
                              <span>
                                {new Date(a.published_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
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
              <p className="cams-empty">
                No posts yet — run `python -m app.ingest_news --brand fyicams` to populate the feed.
              </p>
            )}
          </div>
        </section>

        <section className="cams-hero">
          <div className="wrap cams-hero-grid">
            <div className="cams-hero-left">
              <span className="cams-hero-eyebrow">
                <span className="cams-hero-eyebrow-dot" />
                Updated 6:00am daily
              </span>
              <h1>
                Every camera story worth <em>your</em> attention — verified, scored, before anyone else covers it.
              </h1>
              <p className="cams-hero-dek">
                Gear announcements, hands-on scoring, and buying guides from people who actually shoot. No brand
                allegiance. No spec-sheet paraphrasing.
              </p>
              <div className="cams-hero-ctas">
                {leadReview ? (
                  <Link className="cams-hero-cta-primary" href={`/reviews/${leadReview.slug}`} prefetch={false}>
                    Read today&apos;s review
                  </Link>
                ) : (
                  <Link className="cams-hero-cta-primary" href="/" prefetch={false}>
                    Read the latest
                  </Link>
                )}
                <a className="cams-hero-cta-secondary" href="#rumor-mill">
                  See the rumors →
                </a>
              </div>
            </div>
            <div className="cams-hero-right">
              <span className="cams-scores-label">Today&apos;s scores</span>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <Link className="cams-score-row" href={`/reviews/${r.slug}`} key={r.slug} prefetch={false}>
                    <span
                      className="cams-score-badge"
                      style={{ background: r.verdictLabel === "Coming Soon" ? "#8C8779" : scoreColor(r.score) }}
                    >
                      {r.verdictLabel === "Coming Soon" ? "—" : r.score.toFixed(1)}
                    </span>
                    <span className="cams-score-title">{r.productName}</span>
                  </Link>
                ))
              ) : (
                <p className="cams-scores-empty">No scored reviews yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="cams-compare" id="compare">
          <div className="wrap">
            <div className="cams-compare-head">
              <h2>Quick compare: this week&apos;s contenders</h2>
            </div>
            <div className="cams-compare-table">
              <div className="cams-compare-th">Model</div>
              <div className="cams-compare-th">Sensor</div>
              <div className="cams-compare-th">Burst</div>
              <div className="cams-compare-th">Price</div>
              <div className="cams-compare-th">Score</div>
              {COMPARE_ROWS.map((c) => (
                <div className="cams-compare-row" key={c.model}>
                  <div className="cams-compare-cell model">{c.model}</div>
                  <div className="cams-compare-cell">{c.sensor}</div>
                  <div className="cams-compare-cell">{c.burst}</div>
                  <div className="cams-compare-cell">{c.price}</div>
                  <div className="cams-compare-cell">
                    <span className="cams-compare-score">{c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cams-section cams-rule" id="rumor-mill">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Rumors</h2>
            </div>
            {rumors.length > 0 ? (
              rumors.map((r) => (
                <Link className="cams-rumor-row" href={`/${r.slug}`} key={r.slug} prefetch={false}>
                  <div className="cams-rumor-date">
                    {new Date(r.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div>
                    <div className="cams-rumor-title">{r.title}</div>
                    {r.dek && <p className="cams-rumor-dek">{r.dek}</p>}
                    {r.author && <span className="cams-rumor-source">via {r.author}</span>}
                  </div>
                  <span className="cams-rumor-arrow">→</span>
                </Link>
              ))
            ) : (
              <p className="cams-rumor-empty">No rumors tracked right now — check back soon.</p>
            )}
          </div>
        </section>

        <section className="cams-section" id="deals">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Today&apos;s deals</h2>
              <span className="cams-deals-note">Includes affiliate links · we may earn a commission</span>
            </div>
            <div className="cams-deal-grid">
              {DEALS.map((d) => (
                <a
                  className="cams-deal-card"
                  href={d.amazonUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  key={d.title}
                >
                  <span className="cams-deal-tag">Gear pick</span>
                  <h4>{d.title}</h4>
                  <span className="cams-deal-price">{d.fromPrice}</span>
                  <p className="cams-deal-note">{d.note}</p>
                  <span className="cams-deal-cta">Check price on Amazon →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="cams-section" id="podcast">
          <div className="wrap cams-two-col">
            <div className="cams-info-card">
              <span className="cams-info-eyebrow">
                Podcast <span className="cams-coming-soon-badge">Coming Soon</span>
              </span>
              <h4>Scored reviews and verified rumors — now in audio</h4>
              <p>We're building a weekly show breaking down the gear news and reviews you read here. Subscribe to the newsletter to know the moment it launches.</p>
              <a href="#newsletter">Get notified →</a>
            </div>
            <div className="cams-info-card">
              <span className="cams-info-eyebrow">Got a tip?</span>
              <h4>Gear leaks, corrections, or a review we should be chasing</h4>
              <p>Spotted something we got wrong, or have a story worth looking into? We read every message.</p>
              <SendTipForm brandName={brand.name} />
            </div>
          </div>
        </section>

        <div className="wrap" style={{ paddingBottom: 64 }} id="newsletter">
          <div className="cams-newsletter-band">
            <div>
              <h2>Get the morning roundup</h2>
              <p>One email, every weekday. Scored reviews, verified rumors, none of the noise.</p>
            </div>
            <CamsNewsletterForm brandSlug={brand.slug} />
          </div>
        </div>
      </main>

      <CamsFooter brand={brand} brands={brands} />
    </div>
  );
}
