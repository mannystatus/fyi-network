// Hardcoded v1 content for CamsHomepage's non-article sections (quick
// compare, video reviews, deals). None of these content shapes exist in
// the backend yet — see the add-brand plan's backend-scope note — so this
// is hand-maintained config for now, same pattern as buyersGuideRegistry.ts.
// The rumor mill widget used to live here too but now reads real ingested
// Rumors-category articles (see CamsHomepage.tsx) instead of fake copy.
import { amazonSearchUrl } from "./buyersGuide";

// Same real Amazon Associates tag used by macBuyersGuide.ts/googleBuyersGuide.ts.
const AMAZON_ASSOCIATES_TAG = "wisedealsxyz-20";
const amazon = (query: string) => amazonSearchUrl(AMAZON_ASSOCIATES_TAG, query);

export const COMPARE_ROWS = [
  { model: "Flagship Mirrorless X2", sensor: "Full-frame 45MP", burst: "20 fps", price: "$3,199", score: "8.9" },
  { model: "Enthusiast APS-C R5", sensor: "APS-C 26MP", burst: "15 fps", price: "$1,499", score: "8.2" },
  { model: "Compact Travel Z", sensor: "1-inch 20MP", burst: "10 fps", price: "$899", score: "7.4" },
];

// Real, named gear — each links out to Amazon via the affiliate tag above.
// Deliberately no fabricated "was/now" discount claim: we have no live
// pricing feed to verify an actual sale is happening, so `fromPrice` is an
// approximate current price only (same honest convention buyersGuide.ts
// already uses), not a discount claim.
export type CamsDeal = { title: string; fromPrice: string; note: string; amazonUrl: string };

export const DEALS: CamsDeal[] = [
  {
    title: "Sony FE 35mm f/1.4 GM",
    fromPrice: "from $1,398",
    note: "Sony's flagship wide prime — the natural pairing for the A7R VI in our reviews.",
    amazonUrl: amazon("Sony FE 35mm f/1.4 GM lens"),
  },
  {
    title: "Sony Alpha a6100 w/ 16-50mm kit lens",
    fromPrice: "from $748",
    note: "The APS-C body we point beginners to — real-time tracking AF without flagship pricing.",
    amazonUrl: amazon("Sony Alpha a6100 16-50mm kit lens"),
  },
  {
    title: "SanDisk Extreme PRO 128GB CFexpress Type A",
    fromPrice: "from $189",
    note: "The card format Sony's own high-speed bodies (A7R VI included) actually require.",
    amazonUrl: amazon("SanDisk Extreme PRO 128GB CFexpress Type A"),
  },
];
