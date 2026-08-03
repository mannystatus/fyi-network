// fyiCams's structured "Review" content — score, verdict, pros/cons, specs,
// and a head-to-head comparison table. There's no backend support for this
// shape yet (no score/pros/cons/spec columns on Article — see the add-brand
// plan), so for v1 this is hand-maintained config, same pattern as
// buyersGuideRegistry.ts's per-brand product data. Keyed by slug, which
// doubles as both the /reviews/[slug] path AND (optionally) a real Article
// slug authored via /admin with the same slug, so [slug]/page.tsx can show
// a "Read full review" sidebar linking the two together.

export type CamsSpecRow = { label: string; value: string };
export type CamsComparisonRow = { spec: string; product: string; rivalA: string; rivalB: string };

export type CamsReview = {
  slug: string;
  productName: string;
  category: string;
  priceLine: string; // e.g. "Third-party 50mm f/1.8 · $349 · Full-frame & APS-C mounts"
  score: number;
  verdictLabel: string; // "Editor's Choice"
  verdict: string;
  pros: string[];
  cons: string[];
  specsShort: CamsSpecRow[]; // 5 rows, shown in the article sidebar
  specsFull: CamsSpecRow[]; // full spec table on the review page
  rivalNames: [string, string];
  comparisonRows: CamsComparisonRow[];
  sponsoredPrice?: string;
};

export const CAMS_REVIEWS: Record<string, CamsReview> = {
  "compact-50mm-prime-review": {
    slug: "compact-50mm-prime-review",
    productName: "Compact 50mm f/1.8 prime",
    category: "Compact Prime Lens",
    priceLine: "Third-party 50mm f/1.8 · $349 · Full-frame & APS-C mounts",
    score: 9.1,
    verdictLabel: "Editor's Choice",
    verdict:
      "Center sharpness rivals lenses three times the price, with autofocus speed that surprised every tester on staff.",
    pros: [
      "Exceptional center sharpness wide open",
      "Fast, near-silent autofocus motor",
      "Compact and lightweight for daily carry",
      "Priced well below comparable primes",
    ],
    cons: ["Soft corners until f/2.2", "No weather sealing", "Plastic mount on the base version"],
    specsShort: [
      { label: "Mount", value: "Full-frame / APS-C" },
      { label: "Max aperture", value: "f/1.8" },
      { label: "Weight", value: "203g" },
      { label: "Price", value: "$349" },
      { label: "Our score", value: "9.1 / 10" },
    ],
    specsFull: [
      { label: "Focal length", value: "50mm" },
      { label: "Max aperture", value: "f/1.8" },
      { label: "Min aperture", value: "f/16" },
      { label: "Elements / groups", value: "7 / 6" },
      { label: "Autofocus motor", value: "Linear STM" },
      { label: "Minimum focus distance", value: "0.38m" },
      { label: "Filter thread", value: "52mm" },
      { label: "Weight", value: "203g" },
    ],
    rivalNames: ["Rival A", "Rival B"],
    comparisonRows: [
      { spec: "Price", product: "$349", rivalA: "$599", rivalB: "$449" },
      { spec: "Center sharpness (MTF)", product: "0.82", rivalA: "0.79", rivalB: "0.71" },
      { spec: "AF speed (0.2s test)", product: "Pass", rivalA: "Pass", rivalB: "Fail" },
      { spec: "Weight", product: "203g", rivalA: "305g", rivalB: "240g" },
      { spec: "Weather sealing", product: "No", rivalA: "Yes", rivalB: "No" },
    ],
    sponsoredPrice: "$349 at our retail partner",
  },
};
