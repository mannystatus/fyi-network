// fyiGoogle's Buyers Guide data (/buyers-guide). See buyersGuide.ts for the
// shared types/verdict logic this plugs into, and macBuyersGuide.ts for the
// same structure applied to fyiMac.
//
// Release dates below are sourced from Google's actual release history per
// product line, as of 2026-07-31 — most notably, Google has already
// confirmed its next "Made by Google" hardware event for August 12, 2026
// (Pixel 11 series + Pixel Watch 5), which is why those products carry a
// `nextEventOn` instead of just a cycle-average guess. Re-verify all of
// this whenever Google ships something new.
import { amazonSearchUrl, awinDeepUrl, type GuideConfig, type GuideProduct } from "./buyersGuide";

// Real Amazon Associates tag, shared across the fyi network's buyers guides.
const AMAZON_ASSOCIATES_TAG = "wisedealsxyz-20";
// Unlike Apple (which runs its affiliate program through Rakuten), Google
// doesn't have a single confirmed affiliate network for store.google.com.
// Awin is used here as the fallback network per the original brief, but
// BOTH ids below are unverified placeholders — confirm store.google.com is
// actually listed as an Awin advertiser (and get real ids) before launch.
const AWIN_AFFILIATE_ID = "000000";
const AWIN_GOOGLE_ADVERTISER_ID = "00000";

const amazon = (query: string) => amazonSearchUrl(AMAZON_ASSOCIATES_TAG, query);
const google = (path: string) => awinDeepUrl(AWIN_AFFILIATE_ID, AWIN_GOOGLE_ADVERTISER_ID, `https://store.google.com${path}`);

const PRODUCTS: GuideProduct[] = [
  // ---- Pixel ----
  {
    id: "pixel-10",
    category: "Pixel",
    name: "Pixel 10",
    chip: "Tensor G5",
    fromPrice: "$799",
    releasedOn: "2025-08-28",
    avgCycleDays: 365,
    nextEventOn: "2026-08-12",
    note: "Google has already confirmed the Pixel 11 launch event — the 10 is about to be last year's phone.",
    amazonUrl: amazon("Google Pixel 10"),
    storeUrl: google("/product/pixel_10"),
  },
  {
    id: "pixel-10-pro",
    category: "Pixel",
    name: "Pixel 10 Pro",
    chip: "Tensor G5",
    fromPrice: "$999",
    releasedOn: "2025-08-28",
    avgCycleDays: 365,
    nextEventOn: "2026-08-12",
    note: "Same confirmed August 12 replacement as the base Pixel 10 — hold off unless you need a phone this week.",
    amazonUrl: amazon("Google Pixel 10 Pro"),
    storeUrl: google("/product/pixel_10_pro"),
  },
  {
    id: "pixel-10-pro-xl",
    category: "Pixel",
    name: "Pixel 10 Pro XL",
    chip: "Tensor G5",
    fromPrice: "$1,199",
    releasedOn: "2025-08-28",
    avgCycleDays: 365,
    nextEventOn: "2026-08-12",
    note: "The Pixel 11 Pro XL is expected at the same August 12 event as the rest of the flagship line.",
    amazonUrl: amazon("Google Pixel 10 Pro XL"),
    storeUrl: google("/product/pixel_10_pro_xl"),
  },
  {
    id: "pixel-10-pro-fold",
    category: "Pixel",
    name: "Pixel 10 Pro Fold",
    chip: "Tensor G5",
    fromPrice: "$1,799",
    releasedOn: "2025-10-09",
    avgCycleDays: 365,
    note: "The Pro Fold launched about six weeks after the rest of the 10 lineup last year — its replacement typically follows the same lag after the August event rather than landing on it.",
    amazonUrl: amazon("Google Pixel 10 Pro Fold"),
    storeUrl: google("/product/pixel_10_pro_fold"),
  },

  // ---- Pixel Watch ----
  {
    id: "pixel-watch-4",
    category: "Pixel Watch",
    name: "Pixel Watch 4",
    chip: "Snapdragon W5",
    fromPrice: "$349",
    releasedOn: "2025-10-09",
    avgCycleDays: 365,
    nextEventOn: "2026-08-12",
    note: "Pixel Watch 5 is confirmed for the same August 12 event as the Pixel 11 — this one's about to be the previous generation.",
    amazonUrl: amazon("Google Pixel Watch 4"),
    storeUrl: google("/product/pixel_watch_4"),
  },

  // ---- Pixel Buds ----
  {
    id: "pixel-buds-pro-2",
    category: "Pixel Buds",
    name: "Pixel Buds Pro 2",
    chip: "Tensor A1",
    fromPrice: "$229",
    releasedOn: "2024-09-26",
    avgCycleDays: 730,
    note: "Nearly two years old and past its typical cycle, but there's no confirmed Buds Pro 3 — Google may skip a refresh at the August event entirely this year.",
    amazonUrl: amazon("Google Pixel Buds Pro 2"),
    storeUrl: google("/product/pixel_buds_pro_2"),
  },
  {
    id: "pixel-buds-2a",
    category: "Pixel Buds",
    name: "Pixel Buds 2a",
    chip: "Tensor A1",
    fromPrice: "$129",
    releasedOn: "2025-10-09",
    avgCycleDays: 900,
    note: "Google's budget earbuds only get revisited every few years — this one's fresh, with plenty of runway left.",
    amazonUrl: amazon("Google Pixel Buds 2a"),
    storeUrl: google("/product/pixel_buds_2a"),
  },

  // ---- Pixel Tablet ----
  {
    id: "pixel-tablet",
    category: "Pixel Tablet",
    name: "Pixel Tablet",
    chip: "Tensor G2",
    fromPrice: "$499",
    releasedOn: "2023-06-20",
    avgCycleDays: 730,
    note: "Three-plus years old with no second generation announced — the oldest actively-sold chip in Google's lineup, and it's unclear if Google is even continuing this line.",
    amazonUrl: amazon("Google Pixel Tablet"),
    storeUrl: google("/product/pixel_tablet"),
  },

  // ---- Google Home & Nest ----
  {
    id: "google-home-speaker",
    category: "Google Home & Nest",
    name: "Google Home Speaker",
    chip: "N/A",
    fromPrice: "$99",
    releasedOn: "2026-06-25",
    avgCycleDays: 1500,
    note: "Brand new — the first Google-branded smart speaker built around Gemini for Home. Nothing to wait for yet.",
    amazonUrl: amazon("Google Home Speaker Gemini"),
    storeUrl: google("/product/google_home_speaker"),
  },
  {
    id: "nest-cam-indoor",
    category: "Google Home & Nest",
    name: "Nest Cam Indoor (3rd gen)",
    chip: "N/A",
    fromPrice: "$99.99",
    releasedOn: "2025-10-01",
    avgCycleDays: 1500,
    note: "Refreshed with 2K HDR and a wider field of view — recently updated, safe to buy.",
    amazonUrl: amazon("Google Nest Cam Indoor 3rd gen"),
    storeUrl: google("/product/nest_cam_indoor"),
  },
  {
    id: "nest-cam-outdoor",
    category: "Google Home & Nest",
    name: "Nest Cam Outdoor (2nd gen)",
    chip: "N/A",
    fromPrice: "$149.99",
    releasedOn: "2025-10-01",
    avgCycleDays: 1500,
    note: "Same October refresh as the indoor cam — recently updated, safe to buy.",
    amazonUrl: amazon("Google Nest Cam Outdoor 2nd gen"),
    storeUrl: google("/product/nest_cam_outdoor"),
  },
  {
    id: "nest-doorbell",
    category: "Google Home & Nest",
    name: "Nest Doorbell (3rd gen)",
    chip: "N/A",
    fromPrice: "$179.99",
    releasedOn: "2025-10-01",
    avgCycleDays: 1500,
    note: "Part of the same October camera refresh — freshest doorbell Google sells.",
    amazonUrl: amazon("Google Nest Doorbell 3rd gen"),
    storeUrl: google("/product/nest_doorbell"),
  },
  {
    id: "nest-learning-thermostat",
    category: "Google Home & Nest",
    name: "Nest Learning Thermostat (4th gen)",
    chip: "N/A",
    fromPrice: "$279.99",
    releasedOn: "2024-08-20",
    avgCycleDays: 1460,
    note: "Google only revisits the thermostat every few years, so this one still has plenty of room left in its cycle.",
    amazonUrl: amazon("Google Nest Learning Thermostat 4th gen"),
    storeUrl: google("/product/nest_learning_thermostat_4th_gen"),
  },
  {
    id: "nest-hub",
    category: "Google Home & Nest",
    name: "Nest Hub (2nd gen)",
    chip: "N/A",
    fromPrice: "$99.99",
    releasedOn: "2021-03-30",
    avgCycleDays: 1200,
    note: "Over five years old — Google itself has hinted at a new Nest Hub with 'an incredible form factor' coming for Gemini for Home. A strong candidate to wait on.",
    amazonUrl: amazon("Google Nest Hub 2nd gen"),
    storeUrl: google("/product/nest_hub_2nd_gen"),
  },
];

export const GOOGLE_GUIDE: GuideConfig = {
  storeName: "Google",
  heading: "Should you buy that Google product right now?",
  dek: "Google refreshes its hardware on a fairly predictable cycle — Pixel phones and the Pixel Watch every August, everything else more sporadically. Buy right after an update and you get the newest hardware for a full cycle; buy right before one and you're stuck with old hardware the moment it ships. Below is where every current Pixel and Nest device sits in its cycle, updated automatically as time passes.",
  disclosureNote:
    "Disclosure: fyiGoogle is an Amazon Associate and an Awin affiliate. We may earn a commission on qualifying purchases made through the links below, at no extra cost to you. That has no bearing on the buy / wait guidance above each product.",
  categoryOrder: ["Pixel", "Pixel Watch", "Pixel Buds", "Pixel Tablet", "Google Home & Nest"],
  products: PRODUCTS,
};
