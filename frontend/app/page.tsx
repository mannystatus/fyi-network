import type { Metadata } from "next";
import { getArticles, getAllBrands, getCurrentBrand } from "../lib/api";
import { buildKeywords } from "../lib/seo";
import ArticleList from "../components/ArticleList";
import CamsHomepage from "../components/CamsHomepage";
import EditorialHomepage from "../components/EditorialHomepage";
import FlyNowHomepage from "../components/FlyNowHomepage";
import LatestFromUs from "../components/LatestFromUs";
import Pagination from "../components/Pagination";
import { EDITORIAL_CONFIGS } from "../lib/editorialConfig";
import { canonicalOrigin } from "../lib/url";

// fyiCams homepage-specific keyword targeting — broader than the per-article/
// per-topic keyword lists elsewhere (those stay scoped to that page's own
// content; this is the site-wide term list meant to surface the homepage
// for the full range of camera-gear search intent).
const CAMS_SEO_KEYWORDS = [
  "camera reviews",
  "camera news",
  "camera rumors",
  "gear updates",
  "firmware updates",
  "new camera releases 2026",
  "camera review",
  "best mirrorless camera",
  "full frame vs APSC",
  "lens comparison",
  "hands-on review",
  "Sony Alpha news",
  "Canon EOS R news",
  "Fujifilm rumor",
  "Nikon Z lens roadmap",
  "DJI rumor",
  "Leica News Rumor",
  "Hassleblad News Rumor",
  "Hassleblad X2D",
  "mirrorless camera",
  "cinema camera",
  "action camera",
  "vlogging camera",
  "prime lens",
  "china",
  "europe",
  "germany",
  "japan",
  "usa",
  "leica stores",
  "leica store",
  "sammys camera",
  "dji",
  "insta360",
  "x5",
  "360 camera",
  "video",
  "software",
  "hardware",
  "adobe",
  "lightroom",
  "capture one",
  "Breaking industry news, leaks, and announcement coverage",
  "In-depth analysis, comparisons, and purchasing advice",
  "Brand-loyal readers tracking specific ecosystems",
  "Buyers exploring specific equipment types",
  "deals",
  "trade-ins",
  "trades",
  "trade",
  "discount",
  "web deals",
  "hackthedeal.com",
];

// Per-brand extra keyword targeting for the editorial-template homepages
// (mac/win/google/netflix/lakers/dodgers) — same purpose as
// CAMS_SEO_KEYWORDS above, keyed by icon since not every brand in
// EDITORIAL_METADATA has its own list yet. Grouped by the requested
// category/intent below only as organization for future edits — the
// category/intent labels themselves aren't included as keywords, only the
// actual phrases are (unlike CAMS_SEO_KEYWORDS, which also includes a few
// full-sentence intent descriptions at the requester's explicit ask).
const EDITORIAL_SEO_KEYWORDS: Record<string, string[]> = {
  mac: [
    // Apple News & Leaks
    "apple news",
    "apple rumors",
    "leaks",
    "WWDC updates",
    "iOS updates",
    "new apple releases 2026",
    // Hardware & Devices
    "iPhone rumors",
    "MacBook Pro review",
    "iPad Air deals",
    "Apple Watch ultra specs",
    "M-series chip analysis",
    // Deals & Buying Guides
    "best iPhone deals",
    "refurbished Mac",
    "Apple trade in value",
    "cheap iPad sales",
    "Black Friday Apple deals",
    // Tutorials & Troubleshooting
    "iOS tips and tricks",
    "how to clean Mac storage",
    "fix iPhone battery drain",
    "best Mac apps",
  ],
  dodgers: [
    // News & Leaks
    "Dodgers news",
    "Dodgers rumors",
    "trade rumors",
    "roster updates",
    "injury report",
    "breaking Dodgers news",
    // Game Analysis & Lineups
    "Dodgers starting lineup today",
    "score",
    "highlights",
    "game preview",
    "pitch mix",
    "box score",
    // Deals & Tickets
    "cheap Dodgers tickets",
    "Dodgers promo schedule",
    "bobblehead giveaway dates",
    "Dodgers merchandise deals",
    // Evergreen & History
    "Dodgers farm system",
    "top prospects",
    "stadium guide",
    "parking tips",
    "Dodgers schedule 2026",
  ],
  lakers: [
    // News & Leaks
    "Lakers news",
    "Lakers rumors",
    "trade deadline targets",
    "free agency leaks",
    "roster updates",
    // Game Analysis & Lineups
    "Lakers starting 5",
    "injury report",
    "score",
    "post game quotes",
    "rotation analysis",
    // Deals & Tickets
    "Lakers ticket deals",
    "Crypto.com Arena seating guide",
    "Lakers jersey sales",
    "court side tickets",
    // Evergreen & History
    "Lakers salary cap",
    "future draft picks",
    "head coach updates",
    "Lakers stats",
    "playoff picture",
  ],
  netflix: [
    // New Releases & News
    "new on Netflix this week",
    "upcoming Netflix movies",
    "series announcements",
    "renewed shows",
    "canceled shows",
    // Reviews & Recommendations
    "best movies on Netflix right now",
    "top series to binge",
    "secret categories",
    "hidden gems",
    // Deals & Subscriptions
    "Netflix price plans",
    "cheapest tier",
    "account sharing rules",
    "free trial",
    "subscription deals",
    // Troubleshooting & Hacks
    "how to change Netflix password",
    "fix error code",
    "download movies offline",
    "best audio settings",
  ],
};

const EDITORIAL_METADATA: Record<string, { title: string; description: string }> = {
  mac: {
    title: "Apple News, Rumors & Buying Guides",
    description: "Every Apple story worth your attention — Mac, iPhone, and iPad news, verified before it trends.",
  },
  win: {
    title: "Windows News, Rumors & Buying Guides",
    description: "Every Windows story worth your attention — PC hardware and OS news, verified before it trends.",
  },
  google: {
    title: "Google News, Rumors & Buying Guides",
    description: "Every Google story worth your attention — Pixel, Android, and Chrome news, verified before it trends.",
  },
  netflix: {
    title: "Netflix News, Renewal Odds & New Releases",
    description: "Renewal odds, new releases, and what's leaving — tracked daily, no clickbait required.",
  },
  lakers: {
    title: "Lakers News, Rumors & Fantasy Corner",
    description: "Lakers beat writers break it down before the highlight shows do — trade rumors, roster moves, and fantasy implications.",
  },
  dodgers: {
    title: "Dodgers News, Rumors & Fantasy Corner",
    description: "Dodgers beat writers break it down before the highlight shows do — trade rumors, roster moves, and fantasy implications.",
  },
};

// fyiFlyNow, fyiCams, and fyiMac/Win/Google/Netflix all have their own
// bespoke landing pages (not the standard article list every other brand
// uses below), so they get their own keyword-targeted title/description
// instead of falling back to the layout's generic "{brand.name} | {tagline}"
// default. openGraph/twitter need the same override — Next only inherits a
// parent layout's metadata field wholesale when the page doesn't specify
// that field at all, so omitting openGraph here (as before) meant every
// brand's homepage shared previews (Slack/iMessage/Twitter) showed the
// generic "{brand.name} / {tagline}" from layout.tsx instead of this
// keyword-rich title, even though the <title> tag and meta description
// were already correct.
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  const url = canonicalOrigin(brand.domain);

  if (brand.icon === "flynow") {
    const title = "Travel Guides, Flight & Airline News";
    const description =
      "Daily flight and airline news, plus real travel guides for destinations abroad — pulled from travel creators who've actually made the trip.";
    return {
      title,
      description,
      keywords: buildKeywords(brand, ["flight deals", "travel guides"]),
      alternates: { canonical: "/" },
      openGraph: { title, description, type: "website", url, siteName: brand.name },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  if (brand.icon === "cams") {
    const title = "Camera News, Reviews & Buying Guides";
    const description =
      "Data-driven camera coverage — gear announcements, hands-on scoring, and buying guides from people who actually shoot.";
    return {
      title,
      description,
      keywords: buildKeywords(brand, CAMS_SEO_KEYWORDS),
      alternates: { canonical: "/" },
      openGraph: { title, description, type: "website", url, siteName: brand.name },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const editorial = EDITORIAL_METADATA[brand.icon];
  if (editorial) {
    return {
      ...editorial,
      keywords: buildKeywords(brand, EDITORIAL_SEO_KEYWORDS[brand.icon] ?? []),
      alternates: { canonical: "/" },
      openGraph: { title: editorial.title, description: editorial.description, type: "website", url, siteName: brand.name },
      twitter: { card: "summary_large_image", title: editorial.title, description: editorial.description },
    };
  }
  return { keywords: buildKeywords(brand), alternates: { canonical: "/" } };
}

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const brand = await getCurrentBrand();

  if (brand.icon === "flynow") {
    const brands = await getAllBrands();
    return <FlyNowHomepage brands={brands} currentSlug={brand.slug} />;
  }

  if (brand.icon === "cams") {
    const brands = await getAllBrands();
    return <CamsHomepage brand={brand} brands={brands} />;
  }

  const editorialConfig = EDITORIAL_CONFIGS[brand.icon];
  if (editorialConfig) {
    const brands = await getAllBrands();
    return <EditorialHomepage brand={brand} brands={brands} config={editorialConfig} />;
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch one extra to know whether an "Older" page actually exists,
  // without needing a separate COUNT query.
  const fetched = await getArticles(undefined, PAGE_SIZE + 1, offset);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      {page === 1 && <LatestFromUs variant="top" />}
      <p className="section-label">Latest</p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        brandSlug={brand.slug}
        emptyMessage={
          page > 1
            ? "Nothing here — go back to page 1."
            : "No articles yet — run `python -m app.ingest_news --all-brands` to populate the feed."
        }
      />
      <Pagination page={page} hasMore={hasMore} basePath="/" />
    </>
  );
}
