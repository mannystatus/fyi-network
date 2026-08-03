import Link from "next/link";
import type { Brand } from "../lib/api";
import { getArticles } from "../lib/api";
import CamsHeader from "./CamsHeader";
import CamsFooter from "./CamsFooter";
import CamsNewsletterForm from "./CamsNewsletterForm";
import { CAMS_REVIEWS } from "../lib/camsReviews";
import { COMPARE_ROWS, VIDEO_REVIEWS, RUMORS, DEALS } from "../lib/camsHomeContent";

const LATEST_COUNT = 8;

function scoreColor(score: number) {
  return score >= 8.5 ? "#0B5E52" : "#C6841F";
}

export default async function CamsHomepage({ brand, brands }: { brand: Brand; brands: Brand[] }) {
  const [latest, reviews] = await Promise.all([
    getArticles(undefined, LATEST_COUNT),
    Promise.resolve(Object.values(CAMS_REVIEWS)),
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
    .cams-score-badge {
      width: 44px; height: 44px; border-radius: 50%; color: #F7F5F1; display: flex; align-items: center;
      justify-content: center; font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: .9rem;
      flex-shrink: 0;
    }
    .cams-score-title { font-size: .92rem; font-weight: 600; line-height: 1.3; }
    .cams-scores-empty { font-size: .85rem; color: #8C8779; padding: 14px 0; }

    /* ---------- COMPARE STRIP ---------- */
    .cams-compare { background: #14120F; color: #F7F5F1; padding: 40px 0; }
    .cams-compare-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; }
    .cams-compare-head h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.4rem; color: #fff; }
    .cams-compare-table { display: grid; grid-template-columns: 1.2fr repeat(4,1fr); border-top: 1px solid rgba(247,245,241,.15); }
    @media (max-width: 700px) { .cams-compare-table { grid-template-columns: 1fr; border-top: none; } }
    .cams-compare-th { padding: 12px 0; font-family: var(--font-cams-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; text-align: center; }
    .cams-compare-th:first-child { text-align: left; }
    @media (max-width: 700px) { .cams-compare-th { display: none; } }
    .cams-compare-row { display: contents; }
    @media (max-width: 700px) { .cams-compare-row { display: block; border-top: 1px solid rgba(247,245,241,.15); padding: 12px 0; } }
    .cams-compare-cell { padding: 14px 0; border-top: 1px solid rgba(247,245,241,.1); text-align: center; font-family: var(--font-cams-mono), monospace; font-size: .84rem; color: #D9D5CB; }
    @media (max-width: 700px) { .cams-compare-cell { border-top: none; padding: 3px 0; text-align: left; } }
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
    .cams-story-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 26px; }
    @media (max-width: 1000px) { .cams-story-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 560px) { .cams-story-grid { grid-template-columns: 1fr; } }
    .cams-story-card { display: flex; flex-direction: column; gap: 12px; }
    .cams-story-thumb {
      aspect-ratio: 4/3; position: relative; display: flex; align-items: center; justify-content: center;
      background: repeating-linear-gradient(45deg,#EDE9E2,#EDE9E2 10px,#E4E0D6 10px,#E4E0D6 20px);
    }
    .cams-story-thumb-cat { position: absolute; top: 10px; left: 10px; background: #14120F; color: #F7F5F1; padding: 4px 9px; font-size: .64rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    .cams-story-thumb-score {
      position: absolute; bottom: 10px; right: 10px; color: #F7F5F1; width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: .78rem;
    }
    .cams-story-card h3 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 600; font-size: 1.05rem; line-height: 1.32; color: #14120F; }
    .cams-story-card p { font-size: .86rem; color: #4A463F; }
    .cams-story-meta { font-size: .74rem; color: #8C8779; font-family: var(--font-cams-mono), monospace; }
    .cams-empty { color: #8C8779; font-size: .9rem; }

    /* ---------- VIDEO REVIEWS ---------- */
    .cams-video-section { background: #EDE9E2; }
    .cams-video-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
    @media (max-width: 800px) { .cams-video-grid { grid-template-columns: 1fr; } }
    .cams-video-card { display: flex; flex-direction: column; gap: 10px; }
    .cams-video-thumb {
      aspect-ratio: 16/9; position: relative; display: flex; align-items: center; justify-content: center;
      background: repeating-linear-gradient(135deg,#DEDAD2,#DEDAD2 10px,#D2CCC0 10px,#D2CCC0 20px);
    }
    .cams-video-play { width: 52px; height: 52px; border-radius: 50%; background: rgba(20,18,15,.85); display: flex; align-items: center; justify-content: center; }
    .cams-video-play-tri { width: 0; height: 0; border-style: solid; border-width: 8px 0 8px 14px; border-color: transparent transparent transparent #F7F5F1; margin-left: 3px; }
    .cams-video-duration { position: absolute; bottom: 8px; right: 8px; background: #14120F; color: #F7F5F1; font-family: var(--font-cams-mono), monospace; font-size: .68rem; padding: 2px 6px; }
    .cams-video-cat { font-family: var(--font-cams-mono), monospace; font-size: .64rem; text-transform: uppercase; letter-spacing: .06em; color: #0B5E52; font-weight: 700; }
    .cams-video-card h4 { font-size: .98rem; font-weight: 600; line-height: 1.32; }

    /* ---------- RUMOR MILL ---------- */
    .cams-rumor-row { display: grid; grid-template-columns: 130px 1fr auto; gap: 24px; align-items: center; padding: 22px 0; border-bottom: 1px solid #E0DCD3; }
    @media (max-width: 700px) { .cams-rumor-row { grid-template-columns: 1fr; gap: 8px; } }
    .cams-rumor-conf { font-family: var(--font-cams-mono), monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; font-weight: 700; }
    .cams-rumor-bar-track { height: 5px; background: #E0DCD3; margin-top: 6px; }
    .cams-rumor-bar-fill { display: block; height: 100%; background: #D9A23B; }
    .cams-rumor-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .cams-rumor-dek { font-size: .85rem; color: #4A463F; }
    .cams-rumor-arrow { color: #0B5E52; font-size: 1.3rem; }

    /* ---------- DEALS ---------- */
    .cams-deals-note { font-family: var(--font-cams-mono), monospace; font-size: .64rem; color: #8C8779; }
    .cams-deal-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    @media (max-width: 800px) { .cams-deal-grid { grid-template-columns: 1fr; } }
    .cams-deal-card { border: 1px solid #E0DCD3; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .cams-deal-pct { align-self: flex-start; background: #0B5E52; color: #F7F5F1; font-family: var(--font-cams-mono), monospace; font-size: .68rem; font-weight: 700; padding: 3px 8px; }
    .cams-deal-price { display: flex; align-items: baseline; gap: 8px; }
    .cams-deal-now { font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: 1.15rem; }
    .cams-deal-was { font-family: var(--font-cams-mono), monospace; font-size: .86rem; color: #8C8779; text-decoration: line-through; }

    /* ---------- PODCAST / COMMUNITY ---------- */
    .cams-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 700px) { .cams-two-col { grid-template-columns: 1fr; } }
    .cams-info-card { border: 1px solid #E0DCD3; padding: 28px; display: flex; flex-direction: column; gap: 10px; }
    .cams-info-eyebrow { font-family: var(--font-cams-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; font-weight: 700; }
    .cams-info-card h4 { font-family: var(--font-cams-display), Newsreader, serif; font-size: 1.2rem; font-weight: 700; }
    .cams-info-card p { font-size: .86rem; color: #4A463F; }
    .cams-info-card a { font-size: .84rem; font-weight: 700; color: #0B5E52; }

    /* ---------- NEWSLETTER ---------- */
    .cams-newsletter-band { background: #0A4A40; color: #F7F5F1; padding: 52px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
    @media (max-width: 700px) { .cams-newsletter-band { grid-template-columns: 1fr; padding: 36px 24px; } }
    .cams-newsletter-band h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.7rem; color: #fff; margin-bottom: 10px; }
    .cams-newsletter-band p { color: #CFE3DF; font-size: .96rem; max-width: 44ch; }
    .cams-newsletter-form { display: flex; gap: 10px; }
    .cams-newsletter-form input { flex: 1; padding: 13px 16px; border: none; font-size: .92rem; font-family: var(--font-cams-body), sans-serif; }
    .cams-newsletter-form button { background: #D9A23B; color: #14120F; border: none; padding: 13px 22px; font-weight: 700; font-size: .9rem; cursor: pointer; }
    .cams-newsletter-form button:disabled { opacity: .7; cursor: default; }
      `}</style>

      <CamsHeader brand={brand} brands={brands} />

      <main>
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
                  See the rumor mill →
                </a>
              </div>
            </div>
            <div className="cams-hero-right">
              <span className="cams-scores-label">Today&apos;s scores</span>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <Link className="cams-score-row" href={`/reviews/${r.slug}`} key={r.slug} prefetch={false}>
                    <span className="cams-score-badge" style={{ background: scoreColor(r.score) }}>
                      {r.score.toFixed(1)}
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

        <section className="cams-section cams-rule">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Latest stories</h2>
              <Link href="/reviews" prefetch={false}>
                View all →
              </Link>
            </div>
            {latest.length > 0 ? (
              <div className="cams-story-grid">
                {latest.map((a) => {
                  const review = CAMS_REVIEWS[a.slug];
                  return (
                    <Link className="cams-story-card" href={`/${a.slug}`} key={a.slug} prefetch={false}>
                      <div className="cams-story-thumb">
                        {a.category && <span className="cams-story-thumb-cat">{a.category}</span>}
                        {review && (
                          <span className="cams-story-thumb-score" style={{ background: scoreColor(review.score) }}>
                            {review.score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3>{a.title}</h3>
                      {a.dek && <p>{a.dek}</p>}
                      <div className="cams-story-meta">
                        {new Date(a.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="cams-empty">
                No posts yet — run `python -m app.ingest_news --brand fyicams` to populate the feed.
              </p>
            )}
          </div>
        </section>

        <section className="cams-section cams-video-section" id="video">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Video reviews</h2>
            </div>
            <div className="cams-video-grid">
              {VIDEO_REVIEWS.map((v) => (
                <div className="cams-video-card" key={v.title}>
                  <div className="cams-video-thumb">
                    <span className="cams-video-play">
                      <span className="cams-video-play-tri" />
                    </span>
                    <span className="cams-video-duration">{v.duration}</span>
                  </div>
                  <span className="cams-video-cat">{v.cat}</span>
                  <h4>{v.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cams-section cams-rule" id="rumor-mill">
          <div className="wrap">
            <div className="cams-section-head">
              <h2>Rumor mill</h2>
            </div>
            {RUMORS.map((r) => (
              <div className="cams-rumor-row" key={r.title}>
                <div>
                  <div className="cams-rumor-conf">
                    {r.label} · {r.pct}%
                  </div>
                  <div className="cams-rumor-bar-track">
                    <span className="cams-rumor-bar-fill" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="cams-rumor-title">{r.title}</div>
                  <p className="cams-rumor-dek">{r.dek}</p>
                </div>
                <span className="cams-rumor-arrow">→</span>
              </div>
            ))}
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
                <div className="cams-deal-card" key={d.title}>
                  <span className="cams-deal-pct">{d.pct}</span>
                  <h4>{d.title}</h4>
                  <div className="cams-deal-price">
                    <span className="cams-deal-now">{d.now}</span>
                    <span className="cams-deal-was">{d.was}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cams-section" id="podcast">
          <div className="wrap cams-two-col">
            <div className="cams-info-card">
              <span className="cams-info-eyebrow">Podcast · Ep. 142</span>
              <h4>Is the megapixel race actually over?</h4>
              <p>Three editors debate whether sensor resolution still matters for working photographers.</p>
              <a href="#podcast">Listen →</a>
            </div>
            <div className="cams-info-card">
              <span className="cams-info-eyebrow">Community</span>
              <h4>Shooters trading notes in the forum</h4>
              <p>Gear troubleshooting, sample galleries, and honest secondhand-market advice.</p>
              <a href="mailto:tips@fyicams.com?subject=Contact">Join the discussion →</a>
            </div>
          </div>
        </section>

        <div className="wrap" style={{ paddingBottom: 64 }} id="newsletter">
          <div className="cams-newsletter-band">
            <div>
              <h2>Get the morning roundup</h2>
              <p>One email, every weekday. Scored reviews, verified rumors, none of the noise.</p>
            </div>
            <CamsNewsletterForm />
          </div>
        </div>
      </main>

      <CamsFooter brandName={brand.name} />
    </div>
  );
}
