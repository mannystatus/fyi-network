import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../../lib/api";
import { CAMS_REVIEWS } from "../../../lib/camsReviews";
import { canonicalOrigin } from "../../../lib/url";
import { buildKeywords } from "../../../lib/seo";

// Brands other than fyiCams 404 here, same pattern as /buyers-guide.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const [brand, { slug }] = await Promise.all([getCurrentBrand(), params]);
  const review = brand.icon === "cams" ? CAMS_REVIEWS[slug] : undefined;
  if (!review) return {};

  const title = `${review.productName} Review — ${review.score.toFixed(1)}/10`;
  const url = `${canonicalOrigin(brand.domain)}/reviews/${slug}`;

  return {
    title,
    description: review.verdict,
    keywords: buildKeywords(brand, [review.productName, review.category, "review"]),
    alternates: { canonical: `/reviews/${slug}` },
    openGraph: {
      title,
      description: review.verdict,
      type: "article",
      url,
      siteName: brand.name,
      images: review.imageUrl ? [{ url: review.imageUrl, width: 1200, height: 900, alt: review.productName }] : undefined,
    },
    twitter: {
      card: review.imageUrl ? "summary_large_image" : "summary",
      title,
      description: review.verdict,
      images: review.imageUrl ? [review.imageUrl] : undefined,
    },
  };
}

export default async function CamsReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [brand, { slug }] = await Promise.all([getCurrentBrand(), params]);
  if (brand.icon !== "cams") notFound();
  const review = CAMS_REVIEWS[slug];
  if (!review) notFound();

  const related = Object.values(CAMS_REVIEWS).filter((r) => r.slug !== slug).slice(0, 3);

  const origin = canonicalOrigin(brand.domain);
  const url = `${origin}/reviews/${slug}`;

  // Google's review-snippet rich results (star rating in search) require a
  // page whose primary content is a single review of a single product —
  // this page is exactly that, one product per slug — so Review +
  // itemReviewed/Product is the correct schema, not an aggregate rating.
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `${review.productName} Review`,
    reviewBody: review.verdict,
    itemReviewed: {
      "@type": "Product",
      name: review.productName,
      image: review.imageUrl,
      category: review.category,
      brand: { "@type": "Brand", name: review.productName.split(" ")[0] },
    },
    keywords: [review.productName, review.category, "review"].join(", "),
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.score,
      bestRating: 10,
      worstRating: 1,
    },
    author: { "@type": "Organization", name: brand.name },
    publisher: { "@type": "Organization", name: brand.name },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${origin}/reviews` },
      { "@type": "ListItem", position: 3, name: review.productName, item: url },
    ],
  };

  return (
    <article className="cams-review-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <style>{`
    .cams-review-page :where(h1, h2, h3, h4, p, ul, li) { margin: 0; padding: 0; }

    /* .breadcrumb / .cams-related-grid / .cams-related-thumb are shared
       with /reviews (the index page), so they live in globals.css's
       theme-cams block instead of here — this page-specific block only has
       styling unique to the single-review template. */

    .cams-review-head { display: grid; grid-template-columns: 1.3fr .7fr; align-items: start; gap: 48px; border-bottom: 2px solid #14120F; padding-bottom: 40px; margin-bottom: 40px; }
    @media (max-width: 800px) { .cams-review-head { grid-template-columns: 1fr; } }
    .cams-review-eyebrow { font-family: var(--font-cams-mono), monospace; font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; color: #0B5E52; font-weight: 700; }
    .cams-review-head h1 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: clamp(1.9rem, 3vw, 2.6rem); line-height: 1.12; margin: 10px 0 16px; }
    .cams-review-priceline { font-size: 1.05rem; color: #4A463F; max-width: 52ch; margin-bottom: 24px; }
    .cams-review-scoreline { display: flex; gap: 28px; }
    .cams-review-scoreline-badge { width: 76px; height: 76px; border-radius: 50%; background: #0B5E52; color: #F7F5F1; display: flex; align-items: center; justify-content: center; font-family: var(--font-cams-mono), monospace; font-weight: 700; font-size: 1.6rem; flex-shrink: 0; }
    .cams-review-scoreline-sub { font-family: var(--font-cams-mono), monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .06em; color: #8C8779; text-align: center; margin-top: 6px; }
    .cams-review-verdict-label { font-weight: 700; font-size: 1rem; }
    .cams-review-verdict-text { font-size: .88rem; color: #4A463F; margin-top: 6px; }
    .cams-review-photo { aspect-ratio: 4/3; width: 100%; object-fit: cover; background: repeating-linear-gradient(45deg,#EDE9E2,#EDE9E2 12px,#E4E0D6 12px,#E4E0D6 24px); display: flex; align-items: center; justify-content: center; font-family: var(--font-cams-mono), monospace; font-size: .7rem; color: #8C8779; }

    .cams-review-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px; }
    @media (max-width: 700px) { .cams-review-proscons { grid-template-columns: 1fr; } }
    .cams-review-box { border: 1px solid #E0DCD3; padding: 24px; }
    .cams-review-box h3 { font-family: var(--font-cams-mono), monospace; font-size: .74rem; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; margin-bottom: 14px; }
    .cams-review-box.pros h3 { color: #0B5E52; }
    .cams-review-box.cons h3 { color: #8C6A2E; }
    .cams-review-box-row { display: flex; gap: 10px; padding: 6px 0; font-size: .92rem; }
    .cams-review-box.pros .cams-review-box-row span { color: #0B5E52; font-weight: 700; }
    .cams-review-box.cons .cams-review-box-row span { color: #C6841F; font-weight: 700; }

    .cams-review-section { margin-bottom: 48px; }
    .cams-review-section h2 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.4rem; margin-bottom: 20px; }
    .cams-spec-row { display: grid; grid-template-columns: 280px 1fr; border-top: 1px solid #E0DCD3; padding: 13px 0; }
    @media (max-width: 600px) { .cams-spec-row { grid-template-columns: 1fr; gap: 2px; } }
    .cams-spec-row span:first-child { font-size: .86rem; color: #8C8779; font-family: var(--font-cams-mono), monospace; }
    .cams-spec-row span:last-child { font-size: .92rem; font-weight: 600; }

    .cams-compare-table-full { display: grid; grid-template-columns: 1.2fr repeat(3,1fr); border-top: 2px solid #14120F; }
    @media (max-width: 700px) { .cams-compare-table-full { grid-template-columns: 1fr; border-top: none; } }
    .cams-compare-table-full-head { padding: 12px 0; font-weight: 700; font-size: .9rem; text-align: center; }
    .cams-compare-table-full-head:first-child { font-family: var(--font-cams-mono), monospace; font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; text-align: left; font-weight: 400; }
    .cams-compare-table-full-head:not(:first-child):not(.this) { color: #4A463F; }
    @media (max-width: 700px) { .cams-compare-table-full-head { display: none; } }
    .cams-compare-cell-full { padding: 12px 0; border-top: 1px solid #E0DCD3; font-size: .86rem; text-align: center; }
    @media (max-width: 700px) { .cams-compare-cell-full { border-top: none; padding: 3px 0; text-align: left; } }
    .cams-compare-cell-full.spec { text-align: left; color: #8C8779; font-family: var(--font-cams-mono), monospace; }
    .cams-compare-cell-full.this { font-weight: 700; background: rgba(11,94,82,.06); }
    @media (max-width: 700px) { .cams-compare-cell-full.this { background: none; } }

    .cams-review-sponsored { background: #14120F; color: #F7F5F1; padding: 32px; display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 48px; flex-wrap: wrap; }
    .cams-review-sponsored-eyebrow { font-family: var(--font-cams-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; color: #8C8779; }
    .cams-review-sponsored h4 { font-family: var(--font-cams-display), Newsreader, serif; font-weight: 700; font-size: 1.15rem; color: #fff; margin-top: 6px; }
    .cams-review-sponsored-btn { background: #D9A23B; color: #14120F; border: none; padding: 13px 24px; font-weight: 700; font-size: .9rem; cursor: pointer; white-space: nowrap; }
      `}</style>

      <p className="breadcrumb">
        <Link href="/" prefetch={false}>
          Home
        </Link>{" "}
        /{" "}
        <Link href="/reviews" prefetch={false}>
          Reviews
        </Link>
      </p>

      <div className="cams-review-head">
        <div>
          <span className="cams-review-eyebrow">Review · {review.category}</span>
          <h1>{review.productName}</h1>
          <p className="cams-review-priceline">{review.priceLine}</p>
          <div className="cams-review-scoreline">
            <div>
              <div className="cams-review-scoreline-badge">{review.score.toFixed(1)}</div>
              <div className="cams-review-scoreline-sub">Our score</div>
            </div>
            <div>
              <div className="cams-review-verdict-label">{review.verdictLabel}</div>
              <p className="cams-review-verdict-text">{review.verdict}</p>
            </div>
          </div>
        </div>
        {review.imageUrl ? (
          <img src={review.imageUrl} alt={review.productName} className="cams-review-photo" />
        ) : (
          <div className="cams-review-photo">PRODUCT SHOT — 4:3</div>
        )}
      </div>

      <div className="cams-review-proscons">
        <div className="cams-review-box pros">
          <h3>Pros</h3>
          {review.pros.map((p) => (
            <div className="cams-review-box-row" key={p}>
              <span>+</span>
              {p}
            </div>
          ))}
        </div>
        <div className="cams-review-box cons">
          <h3>Cons</h3>
          {review.cons.map((c) => (
            <div className="cams-review-box-row" key={c}>
              <span>−</span>
              {c}
            </div>
          ))}
        </div>
      </div>

      <section className="cams-review-section">
        <h2>Full specifications</h2>
        {review.specsFull.map((row) => (
          <div className="cams-spec-row" key={row.label}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </section>

      <section className="cams-review-section">
        <h2>How it compares</h2>
        <div className="cams-compare-table-full">
          <div className="cams-compare-table-full-head" />
          <div className="cams-compare-table-full-head this">This {review.category.split(" ").pop()}</div>
          <div className="cams-compare-table-full-head">{review.rivalNames[0]}</div>
          <div className="cams-compare-table-full-head">{review.rivalNames[1]}</div>
          {review.comparisonRows.map((row) => (
            <div className="cams-compare-row-group" style={{ display: "contents" }} key={row.spec}>
              <div className="cams-compare-cell-full spec">{row.spec}</div>
              <div className="cams-compare-cell-full this">{row.product}</div>
              <div className="cams-compare-cell-full">{row.rivalA}</div>
              <div className="cams-compare-cell-full">{row.rivalB}</div>
            </div>
          ))}
        </div>
      </section>

      {review.sponsoredPrice && (
        <div className="cams-review-sponsored">
          <div>
            <span className="cams-review-sponsored-eyebrow">Sponsored placement</span>
            <h4>Best price found: {review.sponsoredPrice}</h4>
          </div>
          <button className="cams-review-sponsored-btn" type="button">
            Check price →
          </button>
        </div>
      )}

      {related.length > 0 && (
        <section>
          <h2 style={{ fontFamily: "var(--font-cams-display), Newsreader, serif", fontWeight: 700, fontSize: "1.4rem", marginBottom: 24 }}>
            Related reviews
          </h2>
          <div className="cams-related-grid">
            {related.map((r) => (
              <Link href={`/reviews/${r.slug}`} key={r.slug} prefetch={false}>
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.productName} className="cams-related-thumb" />
                ) : (
                  <div className="cams-related-thumb" />
                )}
                <h4>{r.productName}</h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
