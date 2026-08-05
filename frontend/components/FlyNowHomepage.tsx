import Link from "next/link";
import type { Brand } from "../lib/api";
import { getArticles } from "../lib/api";
import { categoryColor } from "../lib/colors";
import { canonicalOrigin } from "../lib/url";
import FlyNowNavbar from "./FlyNowNavbar";
import FlyNowTitlebar from "./FlyNowTitlebar";
import NetworkFooterLinks from "./NetworkFooterLinks";

const BLOG_POST_COUNT = 6;

const COVERAGE_ROWS = [
  { label: "Flight Deals", desc: "Fare drops & sales worth booking" },
  { label: "Airline News", desc: "Policy changes, routes, delays" },
  { label: "Travel Tips", desc: "Airports, packing, booking tricks" },
  { label: "Travel Guides", desc: "City & destination guides from creators" },
];

const STEPS = [
  {
    num: "01",
    title: "Flight & airline news, daily",
    body: "Fare trends, airline policy changes, and airport updates pulled from trusted travel and aviation outlets, updated throughout the day.",
  },
  {
    num: "02",
    title: "Real guides from travel creators",
    body: "Destination and city breakdowns drawn from creators who've actually been there — not generic, templated listicles.",
  },
  {
    num: "03",
    title: "The practical version, fast",
    body: "Every guide and story is boiled down to what actually matters before you book, pack, or fly.",
  },
];

function LogoFlaps({ big = false }: { big?: boolean }) {
  return (
    <div className={big ? "hero-logo-big" : "logo"}>
      <span className="flap sky">f</span>
      <span className="flap sky">y</span>
      <span className="flap sky">i</span>
      <span className="flap coral">F</span>
      <span className="flap coral">l</span>
      <span className="flap coral">y</span>
      <span className="flap amber">N</span>
      <span className="flap amber">o</span>
      <span className="flap amber">w</span>
    </div>
  );
}

export default async function FlyNowHomepage({ brands, currentSlug }: { brands: Brand[]; currentSlug: string }) {
  const posts = (await getArticles()).slice(0, BLOG_POST_COUNT);
  const brand = brands.find((b) => b.slug === currentSlug);
  const origin = canonicalOrigin(brand?.domain ?? "fyiflynow.com");

  return (
    <div className="flynow-homepage">
      <style>{`
    .flynow-homepage {
      --navy:#06122b; --navy2:#0A1A3D; --navy3:#0e2352; --line:#1C3363;
      --sky:#4FC3FF; --coral:#FF6B4A; --amber:#FFB627;
      --text-dim:#7d8db3; --text-dimmer:#4d5d84;
      background: var(--navy);
      color: #eee;
      font-family: var(--font-flynow-sans), 'Inter', -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    .flynow-homepage :where(h1, h2, h3, h4, h5, h6, p, ul, li, form, fieldset, button, input) {
      margin: 0;
      padding: 0;
    }
    .flynow-homepage a { color: inherit; }
    .flynow-homepage .wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px; }

    /* Nav itself is the shared <FlyNowNavbar> (see globals.css's
       .flynow-site-nav rules) — used here and on every other fyiFlyNow page
       via app/template.tsx, so it isn't restyled locally. .logo/.flap below
       are only for the hero's big logo and the footer's small one. */
    .flynow-homepage .logo { display:flex; gap:1px; }
    .flynow-homepage .flap { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-size:15px; color:#fff; background:var(--navy2); border:1px solid var(--line); padding:3px 5px 4px; border-radius:2px; line-height:1; }
    .flynow-homepage .flap.sky{color:var(--sky)} .flynow-homepage .flap.coral{color:var(--coral)} .flynow-homepage .flap.amber{color:var(--amber)}

    /* ---------- HERO ---------- */
    .flynow-homepage .hero {
      background: radial-gradient(120% 140% at 15% 0%, var(--navy3) 0%, var(--navy) 62%);
      padding: 88px 28px 70px;
      position:relative;
      overflow:hidden;
      border-bottom:1px solid #142549;
    }
    .flynow-homepage .hero::before{
      content:''; position:absolute; top:-30%; right:-8%; width:520px; height:520px;
      background: radial-gradient(circle, rgba(255,107,74,.16), transparent 70%);
      pointer-events:none;
    }
    .flynow-homepage .hero-grid { display:grid; grid-template-columns: 1.1fr .9fr; gap:56px; align-items:center; position:relative; }
    @media (max-width: 920px){ .flynow-homepage .hero-grid{ grid-template-columns:1fr; } }

    .flynow-homepage .hero-kicker { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:12px; letter-spacing:.22em; text-transform:uppercase; color:var(--sky); margin-bottom:22px; display:flex; align-items:center; gap:10px; }
    .flynow-homepage .pulse-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); animation:flynow-hero-pulse 1.8s ease-in-out infinite; }
    @keyframes flynow-hero-pulse { 0%,100%{opacity:1} 50%{opacity:.25} }

    .flynow-homepage .hero-logo-big { display:flex; gap:3px; flex-wrap:wrap; margin-bottom:26px; }
    .flynow-homepage .hero-logo-big .flap { font-size:40px; padding:6px 10px 8px; }

    .flynow-homepage .hero h1 { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:30px; line-height:1.28; color:#fff; margin-bottom:18px; max-width:520px; }
    .flynow-homepage .hero h1 .accent { color:var(--amber); }
    .flynow-homepage .hero p.lede { font-size:15px; color:var(--text-dim); line-height:1.7; max-width:460px; margin-bottom:32px; font-weight:300; }

    .flynow-homepage .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; }
    .flynow-homepage .hero-cta-primary {
      font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; font-weight:500;
      background:var(--coral); color:var(--navy); padding:14px 24px; border-radius:8px;
      text-decoration:none; white-space:nowrap; transition:background .15s, transform .15s;
    }
    .flynow-homepage .hero-cta-primary:hover { background:var(--amber); transform:translateY(-1px); }
    .flynow-homepage .hero-cta-secondary {
      font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; font-weight:500;
      background:transparent; color:#fff; padding:14px 24px; border-radius:8px; border:1px solid var(--line);
      text-decoration:none; white-space:nowrap; transition:border-color .15s;
    }
    .flynow-homepage .hero-cta-secondary:hover { border-color: var(--sky); }

    .flynow-homepage .board-card {
      background:var(--navy2); border:1px solid var(--line); border-radius:10px; padding:22px;
      position:relative;
    }
    .flynow-homepage .board-title { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--text-dim); margin-bottom:16px; }
    .flynow-homepage .board-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid #16264d; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; }
    .flynow-homepage .board-row:first-of-type { border-top:none; }
    .flynow-homepage .board-label { font-size:14px; color:#fff; }
    .flynow-homepage .board-desc { font-size:12px; color:var(--text-dim); text-align:right; }

    /* ---------- SECTION HEAD ---------- */
    .flynow-homepage .section { padding:80px 28px; }
    .flynow-homepage .section-head { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--coral); margin-bottom:10px; }
    .flynow-homepage .section h2 { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:28px; color:#fff; margin-bottom:14px; }
    .flynow-homepage .section p.desc { font-size:14px; color:var(--text-dim); max-width:560px; line-height:1.7; font-weight:300; margin-bottom:44px; }

    /* ---------- HOW IT WORKS / SOURCES ---------- */
    .flynow-homepage .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
    @media (max-width:820px){ .flynow-homepage .steps{ grid-template-columns:1fr; } }
    .flynow-homepage .step { border-top:1px solid #16264d; padding-top:20px; }
    .flynow-homepage .step-num { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:13px; color:var(--coral); margin-bottom:12px; }
    .flynow-homepage .step h3 { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:16px; color:#fff; margin-bottom:10px; }
    .flynow-homepage .step p { font-size:13px; color:var(--text-dim); line-height:1.7; font-weight:300; }

    /* ---------- CTA BAND ---------- */
    .flynow-homepage .cta-band {
      background: linear-gradient(135deg, var(--navy3), var(--navy2));
      border-top:1px solid #142549; border-bottom:1px solid #142549;
      padding:64px 28px; text-align:center;
    }
    .flynow-homepage .cta-band h2 { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:26px; color:#fff; margin-bottom:14px; }
    .flynow-homepage .cta-band p { font-size:14px; color:var(--text-dim); margin-bottom:30px; font-weight:300; }
    .flynow-homepage .cta-band-link {
      display:inline-block; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; font-weight:500;
      background:var(--coral); color:var(--navy); padding:14px 26px; border-radius:8px;
      text-decoration:none; transition:background .15s, transform .15s;
    }
    .flynow-homepage .cta-band-link:hover { background:var(--amber); transform:translateY(-1px); }

    /* ---------- FOOTER ---------- */
    .flynow-homepage footer { padding:48px 28px 32px; }
    .flynow-homepage .footer-inner { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:32px; }
    .flynow-homepage .footer-cols { display:flex; gap:64px; flex-wrap:wrap; }
    .flynow-homepage .footer-col h4 { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim); margin-bottom:14px; }
    .flynow-homepage .footer-col a { display:block; font-size:13px; color:#b7c3de; text-decoration:none; margin-bottom:10px; }
    .flynow-homepage .footer-col a:hover { color:#fff; }
    .flynow-homepage .footer-bottom { margin-top:48px; padding-top:24px; border-top:1px solid #16264d; display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; color:var(--text-dimmer); letter-spacing:.03em; }

    /* ---------- BLOG (real posts — the first thing on the page) ---------- */
    .flynow-homepage .blog-section { padding-top: 64px; }
    .flynow-homepage .blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
    @media (max-width:880px){ .flynow-homepage .blog-grid{ grid-template-columns:1fr 1fr; } }
    @media (max-width:600px){ .flynow-homepage .blog-grid{ grid-template-columns:1fr; } }
    .flynow-homepage .blog-card {
      display:block; text-decoration:none;
      background:var(--navy2); border:1px solid var(--line); border-radius:10px; padding:22px;
      transition:border-color .15s, transform .15s;
    }
    .flynow-homepage .blog-card:hover { border-color:var(--coral); transform:translateY(-2px); }
    .flynow-homepage .blog-category { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:10px; letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; display:inline-block; }
    .flynow-homepage .blog-title { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight:400; font-size:16px; color:#fff; line-height:1.35; margin-bottom:10px; }
    .flynow-homepage .blog-dek { font-size:13px; color:var(--text-dim); line-height:1.6; font-weight:300; margin-bottom:16px; }
    .flynow-homepage .blog-meta { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; color:var(--text-dimmer); }
    .flynow-homepage .blog-empty { color:var(--text-dim); font-size:14px; }
      `}</style>

      <FlyNowTitlebar
        domain={brand?.domain ?? "fyiflynow.com"}
        brandSlug={currentSlug}
        brandName={brand?.name ?? "fyiFlyNow"}
        topics={brand?.topics ?? []}
      />
      <FlyNowNavbar brands={brands} currentSlug={currentSlug} brandName={brand?.name ?? "fyiFlyNow"} />

      <section className="section blog-section" id="blog">
        <div className="wrap">
          <div className="section-head">The fyiFlyNow Blog</div>
          <h2>Travel guides, flight news &amp; real tips</h2>
          <p className="desc">
            Flight and airline coverage updated daily, plus destination guides pulled from travel creators who&apos;ve
            actually been there — everything you need before you book, pack, or fly abroad.
          </p>

          {posts.length > 0 ? (
            <div className="blog-grid">
              {posts.map((post) => (
                <Link className="blog-card" href={`/${post.slug}`} key={post.slug} prefetch={false}>
                  {post.category && (
                    <span className="blog-category" style={{ color: categoryColor(post.category) }}>
                      {post.category}
                    </span>
                  )}
                  <div className="blog-title">{post.title}</div>
                  {post.dek && <p className="blog-dek">{post.dek}</p>}
                  <div className="blog-meta">
                    {post.author}
                    {post.author && " · "}
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="blog-empty">
              No posts yet — run `python -m app.ingest_news --brand fyiflynow` to populate the blog.
            </p>
          )}
        </div>

        {posts.length > 0 && (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: posts.map((post, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `${origin}/${post.slug}`,
                  name: post.title,
                })),
              }),
            }}
          />
        )}
      </section>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-kicker">
              <span className="pulse-dot" />
              Now Boarding · Real Travel Guides &amp; Flight News
            </div>
            <LogoFlaps big />
            <h1>
              Travel guides, flight news, and real tips —{" "}
              <span className="accent">before you fly abroad.</span>
            </h1>
            <p className="lede">
              We track flight and airline news daily, and pull practical travel guides from creators covering
              destinations, city breakdowns, and what to actually expect on the ground — so you&apos;re ready before
              you book, pack, or fly.
            </p>
            <div className="hero-ctas">
              <a className="hero-cta-primary" href="#blog">
                Read the blog →
              </a>
              <Link className="hero-cta-secondary" href="/topics/Travel%20Tips">
                Browse travel tips
              </Link>
            </div>
          </div>

          <div className="board-card">
            <div className="board-title">What we cover</div>
            {COVERAGE_ROWS.map((row) => (
              <div className="board-row" key={row.label}>
                <div className="board-label">{row.label}</div>
                <div className="board-desc">{row.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="sources">
        <div className="wrap">
          <div className="section-head">Where Our Coverage Comes From</div>
          <h2>Real news. Real guides. No fluff.</h2>
          <p className="desc">
            No fabricated fare-tracking gimmicks — just flight and airline news worth reading, and travel guides
            drawn from creators who&apos;ve actually made the trip.
          </p>

          <div className="steps">
            {STEPS.map((step) => (
              <div className="step" key={step.num}>
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="wrap">
          <h2>New guides &amp; flight news, every day</h2>
          <p>Fresh coverage lands in the blog daily — no signup required.</p>
          <a className="cta-band-link" href="#blog">
            Read the latest →
          </a>
        </div>
      </div>

      <footer>
        <div className="wrap footer-inner">
          <div>
            <div style={{ marginBottom: 14 }}>
              <LogoFlaps />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", maxWidth: 220, lineHeight: 1.7, fontWeight: 300 }}>
              Travel guides and flight news from the fyi network.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Site</h4>
              <a href="#blog">Blog</a>
              <Link href="/topics/Flight%20Deals">Flight Deals</Link>
              <Link href="/topics/Airline%20News">Airline News</Link>
              <Link href="/topics/Travel%20Tips">Travel Tips</Link>
              <Link href="/topics/Travel%20Guides">Travel Guides</Link>
              <Link href="/travel-advisories">Travel Advisories</Link>
            </div>
            <div className="footer-col">
              <h4>The fyi Network</h4>
              <NetworkFooterLinks brands={brands} currentSlug={currentSlug} />
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <Link href="/advertise">Contact / Advertising</Link>
            </div>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 fyiFlyNow. Part of the fyi network.</span>
          <span>NOW BOARDING · REAL GUIDES, REAL FLIGHT NEWS</span>
        </div>
      </footer>
    </div>
  );
}
