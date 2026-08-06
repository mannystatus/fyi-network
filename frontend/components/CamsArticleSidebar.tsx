import Link from "next/link";
import type { CamsReview } from "../lib/camsReviews";
import CamsScoreGate from "./CamsScoreGate";

// Only rendered on fyiCams article pages whose slug has a matching
// CAMS_REVIEWS entry (see app/[slug]/page.tsx) — an article without an
// in-depth review just doesn't get this sidebar, no placeholder shown.
export default function CamsArticleSidebar({ review, brandSlug }: { review: CamsReview; brandSlug: string }) {
  const isPending = review.verdictLabel === "Coming Soon";
  return (
    <aside className="cams-article-sidebar">
      <div className="cams-article-sidebar-head">Key specs</div>
      {review.specsShort.map((row) => (
        <div className="cams-article-sidebar-row" key={row.label}>
          <span>{row.label}</span>
          <span>
            {row.label !== "Our score" ? (
              row.value
            ) : isPending ? (
              "Coming Soon"
            ) : (
              <CamsScoreGate brandSlug={brandSlug}>{row.value}</CamsScoreGate>
            )}
          </span>
        </div>
      ))}
      <Link href={`/reviews/${review.slug}`} className="cams-article-sidebar-cta" prefetch={false}>
        Read full review →
      </Link>
    </aside>
  );
}
