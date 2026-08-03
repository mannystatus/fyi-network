import type { Metadata } from "next";
import { getArticles, getAllBrands, getCurrentBrand } from "../lib/api";
import ArticleList from "../components/ArticleList";
import CamsHomepage from "../components/CamsHomepage";
import EditorialHomepage from "../components/EditorialHomepage";
import FlyNowHomepage from "../components/FlyNowHomepage";
import LatestFromUs from "../components/LatestFromUs";
import Pagination from "../components/Pagination";
import { EDITORIAL_CONFIGS } from "../lib/editorialConfig";

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
// default.
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  if (brand.icon === "flynow") {
    return {
      title: "Travel Guides, Flight & Airline News",
      description:
        "Daily flight and airline news, plus real travel guides for destinations abroad — pulled from travel creators who've actually made the trip.",
      alternates: { canonical: "/" },
    };
  }
  if (brand.icon === "cams") {
    return {
      title: "Camera News, Reviews & Buying Guides",
      description:
        "Data-driven camera coverage — gear announcements, hands-on scoring, and buying guides from people who actually shoot.",
      alternates: { canonical: "/" },
    };
  }
  const editorial = EDITORIAL_METADATA[brand.icon];
  if (editorial) {
    return { ...editorial, alternates: { canonical: "/" } };
  }
  return { alternates: { canonical: "/" } };
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
