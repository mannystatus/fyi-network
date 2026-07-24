import Link from "next/link";
import type { Brand } from "../lib/api";
import { getArticles } from "../lib/api";
import { categoryColor } from "../lib/colors";
import DomainSwitcher from "./DomainSwitcher";
import FlyNowFareAlertForm from "./FlyNowFareAlertForm";

const BLOG_POST_COUNT = 6;

const DEALS = [
  {
    eyebrow: "Fare Alert",
    badge: "TODAY",
    route: "LAX → NRT",
    meta: "Round trip · Nonstop · Tokyo, Japan",
    price: "$612",
    was: "$1,180",
    spotted: "Spotted 6 min ago",
  },
  {
    eyebrow: "Fare Alert",
    badge: "TODAY",
    route: "JFK → LIS",
    meta: "Round trip · 1 stop · Lisbon, Portugal",
    price: "$398",
    was: "$740",
    spotted: "Spotted 22 min ago",
  },
  {
    eyebrow: "Fare Alert",
    badge: "NEW",
    route: "SFO → AKL",
    meta: "Round trip · Nonstop · Auckland, NZ",
    price: "$719",
    was: "$1,340",
    spotted: "Spotted 1 hr ago",
  },
  {
    eyebrow: "Fare Alert",
    badge: "TODAY",
    route: "ORD → CDG",
    meta: "Round trip · Nonstop · Paris, France",
    price: "$454",
    was: "$890",
    spotted: "Spotted 3 hr ago",
  },
  {
    eyebrow: "Fare Alert",
    badge: "TODAY",
    route: "MIA → BOG",
    meta: "Round trip · Nonstop · Bogotá, Colombia",
    price: "$211",
    was: "$402",
    spotted: "Spotted 4 hr ago",
  },
  {
    eyebrow: "Fare Alert",
    badge: "TODAY",
    route: "SEA → ICN",
    meta: "Round trip · Nonstop · Seoul, South Korea",
    price: "$588",
    was: "$1,050",
    spotted: "Spotted 5 hr ago",
  },
];

const BOARD_ROWS = [
  { route: "LAX → NRT", price: "$612" },
  { route: "JFK → LIS", price: "$398" },
  { route: "ORD → CDG", price: "$454" },
  { route: "SFO → AKL", price: "$719", tag: "NEW" },
];

const STEPS = [
  {
    num: "01",
    title: "We scan constantly",
    body: "Fares across 340+ routes are checked around the clock, watching for drops that don't match the usual pattern.",
  },
  {
    num: "02",
    title: "We verify it's real",
    body: "Every alert is checked by hand before it goes out — no mistake fares, no fine-print surprises, no expired links.",
  },
  {
    num: "03",
    title: "You get the alert",
    body: "A short email lands with the route, the price, and a link — usually within minutes of the fare appearing.",
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

    /* ---------- NAV ---------- */
    .flynow-homepage header.site-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(6,18,43,0.88);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #142549;
    }
    .flynow-homepage .nav-inner { display:flex; align-items:center; justify-content:space-between; gap: 20px; padding:16px 28px; }
    .flynow-homepage .logo { display:flex; gap:1px; }
    .flynow-homepage .flap { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-size:15px; color:#fff; background:var(--navy2); border:1px solid var(--line); padding:3px 5px 4px; border-radius:2px; line-height:1; }
    .flynow-homepage .flap.sky{color:var(--sky)} .flynow-homepage .flap.coral{color:var(--coral)} .flynow-homepage .flap.amber{color:var(--amber)}
    .flynow-homepage nav.links { display:flex; gap:32px; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; letter-spacing:.03em; }
    .flynow-homepage nav.links a { color:#b7c3de; text-decoration:none; transition:color .15s; }
    .flynow-homepage nav.links a:hover { color:#fff; }
    .flynow-homepage .nav-cta {
      font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; font-weight:500;
      background:var(--coral); color:var(--navy); padding:10px 20px; border-radius:24px;
      text-decoration:none; white-space:nowrap;
    }
    @media (max-width: 880px){
      .flynow-homepage nav.links { display:none; }
    }

    /* domain switcher, restyled to sit in this dark nav regardless of the
       site's global light/dark toggle — see globals.css for the defaults
       this overrides. */
    .flynow-homepage .switcher-btn { background:var(--navy2); border:1px solid var(--line); color:#fff; border-radius:24px; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; }
    .flynow-homepage .switcher-btn:hover { border-color: var(--coral); }
    .flynow-homepage .switcher-dot { background: var(--coral); }
    .flynow-homepage .chevron { color: var(--text-dim); }
    .flynow-homepage .switcher-menu { background:var(--navy2); border:1px solid var(--line); }
    .flynow-homepage .brand-opt { color:#fff; }
    .flynow-homepage .brand-opt:hover { background:var(--navy3); }
    .flynow-homepage .brand-opt .current-tag { color:var(--text-dim); }

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

    .flynow-homepage .hero-form { display:flex; gap:10px; max-width:420px; flex-wrap:wrap; }
    .flynow-homepage .hero-form input {
      flex:1; min-width:200px; background:var(--navy2); border:1px solid var(--line); border-radius:8px;
      padding:14px 16px; color:#fff; font-family: var(--font-flynow-sans), 'Inter', sans-serif; font-size:14px;
    }
    .flynow-homepage .hero-form input::placeholder { color:var(--text-dimmer); }
    .flynow-homepage .hero-form button {
      font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:13px; font-weight:500;
      background:var(--coral); color:var(--navy); border:none; padding:14px 24px; border-radius:8px;
      cursor:pointer; white-space:nowrap; transition:background .15s, transform .15s;
    }
    .flynow-homepage .hero-form button:hover { background:var(--amber); transform:translateY(-1px); }
    .flynow-homepage .hero-microcopy { font-size:11px; color:var(--text-dimmer); margin-top:10px; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; letter-spacing:.03em; }

    .flynow-homepage .board-card {
      background:var(--navy2); border:1px solid var(--line); border-radius:10px; padding:22px;
      position:relative;
    }
    .flynow-homepage .board-title { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--text-dim); margin-bottom:16px; display:flex; justify-content:space-between; }
    .flynow-homepage .board-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid #16264d; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; }
    .flynow-homepage .board-row:first-of-type { border-top:none; }
    .flynow-homepage .board-route { font-size:14px; color:#fff; }
    .flynow-homepage .board-route span.dim { color:var(--text-dim); font-weight:400; }
    .flynow-homepage .board-price { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-size:18px; color:var(--amber); }
    .flynow-homepage .board-tag { font-size:10px; color:var(--coral); border:1px solid var(--coral); padding:2px 8px; border-radius:12px; }

    /* ---------- STATS STRIP ---------- */
    .flynow-homepage .stats { border-bottom:1px solid #142549; }
    .flynow-homepage .stats-inner { display:flex; justify-content:space-between; padding:32px 28px; flex-wrap:wrap; gap:24px; }
    .flynow-homepage .stat { text-align:left; }
    .flynow-homepage .stat .num { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-size:26px; color:#fff; }
    .flynow-homepage .stat .label { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim); margin-top:4px; }

    /* ---------- SECTION HEAD ---------- */
    .flynow-homepage .section { padding:80px 28px; }
    .flynow-homepage .section-head { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--coral); margin-bottom:10px; }
    .flynow-homepage .section h2 { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:28px; color:#fff; margin-bottom:14px; }
    .flynow-homepage .section p.desc { font-size:14px; color:var(--text-dim); max-width:560px; line-height:1.7; font-weight:300; margin-bottom:44px; }

    /* ---------- DEAL GRID ---------- */
    .flynow-homepage .deal-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
    @media (max-width:880px){ .flynow-homepage .deal-grid{ grid-template-columns:1fr 1fr; } }
    @media (max-width:600px){ .flynow-homepage .deal-grid{ grid-template-columns:1fr; } }

    .flynow-homepage .deal-card {
      background:var(--navy2); border:1px solid var(--line); border-radius:10px; padding:22px;
      position:relative; overflow:hidden; transition:border-color .15s, transform .15s;
    }
    .flynow-homepage .deal-card:hover { border-color:var(--coral); transform:translateY(-2px); }
    .flynow-homepage .deal-card::before { content:''; position:absolute; top:-40%; right:-20%; width:180px; height:180px; background:radial-gradient(circle, rgba(255,107,74,.16), transparent 70%); pointer-events:none; }
    .flynow-homepage .deal-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; position:relative; }
    .flynow-homepage .deal-eyebrow { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--sky); }
    .flynow-homepage .deal-badge { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:9px; color:var(--amber); border:1px solid var(--amber); padding:3px 8px; border-radius:16px; letter-spacing:.06em; }
    .flynow-homepage .deal-route { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:20px; color:#fff; margin-bottom:6px; position:relative; }
    .flynow-homepage .deal-meta { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; color:var(--text-dim); margin-bottom:16px; position:relative; }
    .flynow-homepage .deal-price-row { display:flex; align-items:baseline; gap:10px; position:relative; }
    .flynow-homepage .deal-price { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-size:30px; color:var(--amber); }
    .flynow-homepage .deal-was { font-family: var(--font-flynow-sans), 'Inter', sans-serif; font-size:13px; color:var(--text-dimmer); text-decoration:line-through; }
    .flynow-homepage .deal-foot { margin-top:18px; padding-top:14px; border-top:1px solid #16264d; display:flex; justify-content:space-between; align-items:center; font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; color:var(--text-dim); position:relative; }
    .flynow-homepage .deal-foot a { color:var(--coral); text-decoration:none; }

    /* ---------- HOW IT WORKS ---------- */
    .flynow-homepage .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
    @media (max-width:820px){ .flynow-homepage .steps{ grid-template-columns:1fr; } }
    .flynow-homepage .step { border-top:1px solid #16264d; padding-top:20px; }
    .flynow-homepage .step-num { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:13px; color:var(--coral); margin-bottom:12px; }
    .flynow-homepage .step h3 { font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:16px; color:#fff; margin-bottom:10px; }
    .flynow-homepage .step p { font-size:13px; color:var(--text-dim); line-height:1.7; font-weight:300; }

    /* ---------- NEWSLETTER CTA ---------- */
    .flynow-homepage .cta-band {
      background: linear-gradient(135deg, var(--navy3), var(--navy2));
      border-top:1px solid #142549; border-bottom:1px solid #142549;
      padding:64px 28px; text-align:center;
    }
    .flynow-homepage .cta-band h2 { font-family: var(--font-flynow-display), 'Archivo Black', sans-serif; font-weight: 400; font-size:26px; color:#fff; margin-bottom:14px; }
    .flynow-homepage .cta-band p { font-size:14px; color:var(--text-dim); margin-bottom:30px; font-weight:300; }
    .flynow-homepage .cta-band .hero-form { margin:0 auto; }

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

    /* ---------- "coming soon" states for the not-yet-real fare-alert feature ---------- */
    .flynow-homepage .coming-soon-pill {
      display:inline-flex; align-items:center; gap:6px;
      font-family: var(--font-flynow-body), 'Space Grotesk', sans-serif; font-size:11px; font-weight:500;
      color:var(--amber); border:1px solid var(--amber); padding:9px 18px; border-radius:24px;
      letter-spacing:.04em; white-space:nowrap; text-decoration:none;
    }
    .flynow-homepage .hero-form input:disabled,
    .flynow-homepage .hero-form button:disabled {
      opacity:.55; cursor:not-allowed;
    }
    .flynow-homepage .hero-form button:disabled {
      background:var(--navy2); color:var(--text-dim); border:1px solid var(--line);
    }
      `}</style>

      <header className="site-nav">
        <div className="nav-inner">
          <LogoFlaps />
          <nav className="links">
            <a href="#blog">Blog</a>
            <a href="#deals">Today&apos;s Deals</a>
            <a href="#how">How It Works</a>
            <a href="#">Destinations</a>
            <a href="#subscribe">Subscribe</a>
          </nav>
          <DomainSwitcher brands={brands} currentSlug={currentSlug} />
          <a className="coming-soon-pill" href="#subscribe">
            <span className="pulse-dot" />
            Fare Alerts: Coming Soon
          </a>
        </div>
      </header>

      <section className="section blog-section" id="blog">
        <div className="wrap">
          <div className="section-head">The fyiFlyNow Blog</div>
          <h2>Travel tips, hacks &amp; real fares</h2>
          <p className="desc">
            Real coverage from real publishers — airline news, fare-booking tips, and travel hacks, updated
            daily. (Live fare alerts are still on the way — see below.)
          </p>

          {posts.length > 0 ? (
            <div className="blog-grid">
              {posts.map((post) => (
                <Link className="blog-card" href={`/${post.slug}`} key={post.slug}>
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
      </section>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-kicker">
              <span className="pulse-dot" />
              Now Boarding · Fare Tracking Coming Soon
            </div>
            <LogoFlaps big />
            <h1>
              We&apos;ll watch fares across hundreds of routes, <span className="accent">so you don&apos;t have to.</span>
            </h1>
            <p className="lede">
              Live fare tracking is on the way — the moment a fare falls through the floor, you&apos;ll know, before
              the airlines notice and pull it back. Until then, real travel deals and tips are already live in the
              blog above.
            </p>
            <FlyNowFareAlertForm />
            <div className="hero-microcopy">Not live yet — check back soon, or read the blog above in the meantime.</div>
          </div>

          <div className="board-card">
            <div className="board-title">
              <span>Departure Board</span>
              <span>Preview</span>
            </div>
            {BOARD_ROWS.map((row) => {
              const [from, to] = row.route.split(" → ");
              return (
                <div className="board-row" key={row.route}>
                  <div className="board-route">
                    {from} <span className="dim">→</span> {to}
                  </div>
                  <div className="board-price">{row.price}</div>
                  {row.tag && <div className="board-tag">{row.tag}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="wrap stats-inner">
          <div className="stat">
            <div className="num">340+</div>
            <div className="label">Routes Tracked</div>
          </div>
          <div className="stat">
            <div className="num">6 min</div>
            <div className="label">Avg. Alert Speed</div>
          </div>
          <div className="stat">
            <div className="num">$412</div>
            <div className="label">Avg. Fare Saved</div>
          </div>
          <div className="stat">
            <div className="num">100%</div>
            <div className="label">Free, No Catch</div>
          </div>
        </div>
      </div>

      <section className="section" id="deals">
        <div className="wrap">
          <div className="section-head">Preview · Coming Soon</div>
          <h2>Fares worth booking</h2>
          <p className="desc">
            A preview of what the live board will look like once fare tracking launches — these example fares
            aren&apos;t bookable yet.
          </p>

          <div className="deal-grid">
            {DEALS.map((deal) => (
              <div className="deal-card" key={deal.route}>
                <div className="deal-top">
                  <span className="deal-eyebrow">{deal.eyebrow}</span>
                  <span className="deal-badge">{deal.badge}</span>
                </div>
                <div className="deal-route">{deal.route}</div>
                <div className="deal-meta">{deal.meta}</div>
                <div className="deal-price-row">
                  <span className="deal-price">{deal.price}</span>
                  <span className="deal-was">{deal.was}</span>
                </div>
                <div className="deal-foot">
                  <span>{deal.spotted}</span>
                  <a href="#">View →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">How It Works</div>
          <h2>Three steps, no app required</h2>
          <p className="desc">
            We do the boring part — scanning fares constantly — so your inbox only hears from us when it&apos;s
            worth it.
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

      <div className="cta-band" id="subscribe">
        <div className="wrap">
          <h2>Fare alerts: coming soon</h2>
          <p>We&apos;re building free, real-time fare alerts. In the meantime, the blog above has real travel deals and tips.</p>
          <FlyNowFareAlertForm />
        </div>
      </div>

      <footer>
        <div className="wrap footer-inner">
          <div>
            <div style={{ marginBottom: 14 }}>
              <LogoFlaps />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", maxWidth: 220, lineHeight: 1.7, fontWeight: 300 }}>
              Real-time fare tracking from the fyi network.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Site</h4>
              <a href="#blog">Blog</a>
              <a href="#deals">Today&apos;s Deals</a>
              <a href="#how">How It Works</a>
              <a href="#">Destinations</a>
            </div>
            <div className="footer-col">
              <h4>The fyi Network</h4>
              <a href="https://fyimac.com">fyiMac</a>
              <a href="https://fyiwin.com">fyiWin</a>
              <a href="https://fyigoogle.com">fyiGoogle</a>
              <a href="https://fyinetflix.com">fyiNetflix</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:tips@fyiflynow.com?subject=Contact">Contact</a>
            </div>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 fyiFlyNow. Part of the fyi network.</span>
          <span>NOW BOARDING · DEALS IN REAL TIME</span>
        </div>
      </footer>
    </div>
  );
}
