import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../lib/api";
import { CAMS_REVIEWS } from "../../lib/camsReviews";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  if (brand.icon !== "cams") return {};
  return {
    title: "Reviews",
    description: "Every camera and lens fyiCams has tested, scored, and verified.",
    alternates: { canonical: "/reviews" },
  };
}

// Same 404-for-other-brands gating as /buyers-guide.
export default async function CamsReviewsIndexPage() {
  const brand = await getCurrentBrand();
  if (brand.icon !== "cams") notFound();

  const reviews = Object.values(CAMS_REVIEWS);

  return (
    <article className="cams-review-page">
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
