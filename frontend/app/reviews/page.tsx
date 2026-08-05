import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../lib/api";
import { CAMS_REVIEWS } from "../../lib/camsReviews";
import { canonicalOrigin } from "../../lib/url";

const DESCRIPTION =
  "Sony, Leica, Nikon, DJI, and Insta360 gear — every camera fyiCams has tested, scored, and verified.";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  if (brand.icon !== "cams") return {};
  const title = "Camera & Lens Reviews";
  const url = `${canonicalOrigin(brand.domain)}/reviews`;
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: "/reviews" },
    openGraph: {
      title,
      description: DESCRIPTION,
      type: "website",
      url,
      siteName: brand.name,
    },
    twitter: {
      card: "summary",
      title,
      description: DESCRIPTION,
    },
  };
}

// Same 404-for-other-brands gating as /buyers-guide.
export default async function CamsReviewsIndexPage() {
  const brand = await getCurrentBrand();
  if (brand.icon !== "cams") notFound();

  const reviews = Object.values(CAMS_REVIEWS);
  const origin = canonicalOrigin(brand.domain);

  // ItemList tells Google this page is a hub linking to individual Review
  // pages (see [slug]/page.tsx's Review/Product schema) rather than a list
  // of unrelated content, reinforcing the site's topical relevance for each
  // product name in the list.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${origin}/reviews/${r.slug}`,
      name: r.productName,
    })),
  };

  return (
    <article className="cams-review-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <p className="breadcrumb">
        <Link href="/" prefetch={false}>
          Home
        </Link>{" "}
        / Reviews
      </p>
      <h1 className="cams-reviews-index-title">Reviews</h1>

      {reviews.length > 0 ? (
        <div className="cams-related-grid">
          {reviews.map((r) => (
            <Link href={`/reviews/${r.slug}`} key={r.slug} prefetch={false}>
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.productName} className="cams-related-thumb" />
              ) : (
                <div className="cams-related-thumb" />
              )}
              <h4>{r.productName}</h4>
              <p className="cams-reviews-index-dek">{r.verdict}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="cams-empty">No reviews published yet.</p>
      )}
    </article>
  );
}
