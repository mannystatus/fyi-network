export const GTM_IDS: Record<string, string> = {
  fyimac: "GTM-PTF62XNG",
  fyiwin: "GTM-NN4VCN78",
};

// GA4 measurement IDs for brands running gtag.js directly instead of (or
// alongside) a GTM container.
export const GA_IDS: Record<string, string> = {
  fyimac: "G-PSQQ1FZD5V",
};

// One AdSense account for the whole network — loaded sitewide, not per-brand.
export const ADSENSE_CLIENT_ID = "ca-pub-6138840929831792";

// Per-placement ad unit IDs, set once each unit is created in the AdSense
// dashboard (Ads > By ad unit > Display ads) and its slot ID added as a
// Vercel env var. A placement with no slot ID configured renders an empty
// "Ad space" placeholder instead of a live ad — see components/AdSlot.tsx.
export const AD_SLOTS = {
  header: process.env.NEXT_PUBLIC_AD_SLOT_HEADER,
  inFeed: process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED,
  // The in-feed unit is AdSense's "Fluid" native-in-feed format, which
  // (unlike header/in-article's plain "auto" display format) requires this
  // extra layout key from the same ad unit — the two only work as a pair.
  inFeedLayoutKey: process.env.NEXT_PUBLIC_AD_LAYOUT_KEY_IN_FEED,
  inArticle: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE,
};
