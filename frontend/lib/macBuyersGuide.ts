// Data + verdict logic for the fyiMac Buyers Guide (/buyers-guide).
//
// Release dates and average refresh-cycle lengths below are sourced from
// Apple's actual release history per product line (confirmed against
// MacRumors' own Buyers Guide, which tracks this the same way, as of
// 2026-07-31). "Age" and the buy verdict are computed at request time from
// `releasedOn`, so the page stays accurate as time passes instead of
// needing a manual refresh — re-verify these entries whenever Apple ships
// something new.

// TODO(launch): replace with fyiMac's own approved Amazon Associates tag
// before this page goes live — this is a placeholder and will not earn
// commission.
const AMAZON_ASSOCIATES_TAG = "fyimac-20";
// Apple's official affiliate program runs through Rakuten Advertising
// (not Amazon) — every product also gets an apple.com link through it,
// alongside its Amazon link, so both revenue paths are covered.
// RAKUTEN_AFFILIATE_ID is the account's real SID.
const RAKUTEN_AFFILIATE_ID = "4725656";
// TODO(launch): verify Apple's current Rakuten "mid" (merchant id) before
// this page goes live — this value hasn't been confirmed against the live
// Rakuten Advertising network.
const RAKUTEN_APPLE_MERCHANT_ID = "11831";

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOCIATES_TAG}`;
}

function rakutenAppleUrl(applePath: string): string {
  const dest = `https://www.apple.com${applePath}`;
  return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_AFFILIATE_ID}&mid=${RAKUTEN_APPLE_MERCHANT_ID}&murl=${encodeURIComponent(dest)}`;
}

export type Category = "Mac" | "iPhone" | "iPad" | "Vision Pro" | "Smart Home & TV";

export type AppleProduct = {
  id: string;
  category: Category;
  name: string;
  chip: string;
  fromPrice: string;
  releasedOn: string; // ISO date of the current model's launch
  avgCycleDays: number; // historical average days between refreshes for this line
  discontinued?: boolean;
  note: string;
  // Not sold on Amazon at all (e.g. a discontinued, refurb-only Mac) omits this.
  amazonUrl?: string;
  appleUrl: string; // apple.com via Rakuten — every product has this one
};

export const CATEGORY_ORDER: Category[] = ["Mac", "iPhone", "iPad", "Vision Pro", "Smart Home & TV"];

export const APPLE_PRODUCTS: AppleProduct[] = [
  // ---- Mac ----
  {
    id: "macbook-air",
    category: "Mac",
    name: "MacBook Air",
    chip: "M5",
    fromPrice: "$999",
    releasedOn: "2026-03-04",
    avgCycleDays: 363,
    note: "Just past the mid-point of its usual yearly refresh — the 13\" and 15\" aren't expected to change again until early 2027.",
    amazonUrl: amazonSearchUrl("Apple MacBook Air M5"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/macbook-air"),
  },
  {
    id: "macbook-pro",
    category: "Mac",
    name: "MacBook Pro 14\"/16\"",
    chip: "M5 / M5 Pro / M5 Max",
    fromPrice: "$1,599",
    releasedOn: "2026-03-04",
    avgCycleDays: 384,
    note: "Freshest Mac in the lineup. A minor entry-level 14\" bump is rumored for fall 2026, but the Pro/Max models you'd actually want aren't affected.",
    amazonUrl: amazonSearchUrl("Apple MacBook Pro M5"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/macbook-pro"),
  },
  {
    id: "macbook-neo",
    category: "Mac",
    name: "MacBook Neo",
    chip: "A18 Pro",
    fromPrice: "$699",
    releasedOn: "2026-03-04",
    avgCycleDays: 365,
    note: "Apple's new entry-level laptop, launched alongside the M5 refresh — this is its first generation, so there's nothing to wait for yet.",
    amazonUrl: amazonSearchUrl("Apple MacBook Neo"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/macbook-neo"),
  },
  {
    id: "imac",
    category: "Mac",
    name: "iMac 24\"",
    chip: "M4",
    fromPrice: "$1,299",
    releasedOn: "2024-10-23",
    avgCycleDays: 551,
    note: "Already running well past its typical refresh window — the first iMac update in two years is expected this fall.",
    amazonUrl: amazonSearchUrl("Apple iMac 24-inch M4"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/imac"),
  },
  {
    id: "mac-mini",
    category: "Mac",
    name: "Mac mini",
    chip: "M4 / M4 Pro",
    fromPrice: "$599",
    releasedOn: "2024-10-23",
    avgCycleDays: 732,
    note: "Not yet past its historical average cycle, but M5 Pro/M6 versions are already in the pipeline for later this year.",
    amazonUrl: amazonSearchUrl("Apple Mac mini M4"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/mac-mini"),
  },
  {
    id: "mac-studio",
    category: "Mac",
    name: "Mac Studio",
    chip: "M4 Max / M3 Ultra",
    fromPrice: "$1,999",
    releasedOn: "2025-03-02",
    avgCycleDays: 547,
    note: "Approaching its typical refresh window, with M5 Max/Ultra versions reportedly in development.",
    amazonUrl: amazonSearchUrl("Apple Mac Studio M4 Max"),
    appleUrl: rakutenAppleUrl("/shop/buy-mac/mac-studio"),
  },
  {
    id: "mac-pro",
    category: "Mac",
    name: "Mac Pro",
    chip: "M2 Ultra",
    fromPrice: "$6,999",
    releasedOn: "2023-06-13",
    avgCycleDays: 0,
    discontinued: true,
    note: "Apple discontinued the Mac Pro in March 2026 with no replacement announced. Not sold new on Amazon — Apple's certified-refurbished stock is the only official channel left.",
    appleUrl: rakutenAppleUrl("/shop/refurbished/mac/mac-pro"),
  },

  // ---- iPhone ----
  {
    id: "iphone-17-pro",
    category: "iPhone",
    name: "iPhone 17 Pro",
    chip: "A19 Pro",
    fromPrice: "$1,099",
    releasedOn: "2025-09-12",
    avgCycleDays: 365,
    note: "Ten-plus months old — squarely in the back half of Apple's yearly September cycle, with the 18 Pro's thermal/camera redesign expected this fall.",
    amazonUrl: amazonSearchUrl("Apple iPhone 17 Pro"),
    appleUrl: rakutenAppleUrl("/shop/buy-iphone/iphone-17-pro"),
  },
  {
    id: "iphone-17",
    category: "iPhone",
    name: "iPhone 17",
    chip: "A19",
    fromPrice: "$799",
    releasedOn: "2025-09-12",
    avgCycleDays: 365,
    note: "Same September cadence as the Pro — a replacement is expected around the same time this fall.",
    amazonUrl: amazonSearchUrl("Apple iPhone 17"),
    appleUrl: rakutenAppleUrl("/shop/buy-iphone/iphone-17"),
  },
  {
    id: "iphone-air",
    category: "iPhone",
    name: "iPhone Air",
    chip: "A19",
    fromPrice: "$999",
    releasedOn: "2025-09-12",
    avgCycleDays: 365,
    note: "Apple's new super-thin model, launched alongside the 17 lineup — first generation of this design, but still on the same annual clock as the rest of the family.",
    amazonUrl: amazonSearchUrl("Apple iPhone Air"),
    appleUrl: rakutenAppleUrl("/shop/buy-iphone/iphone-air"),
  },
  {
    id: "iphone-17e",
    category: "iPhone",
    name: "iPhone 17e",
    chip: "A19",
    fromPrice: "$599",
    releasedOn: "2026-03-04",
    avgCycleDays: 376,
    note: "The budget model runs on its own spring cycle, separate from the September flagships — plenty of runway left before the next one.",
    amazonUrl: amazonSearchUrl("Apple iPhone 17e"),
    appleUrl: rakutenAppleUrl("/shop/buy-iphone/iphone-17e"),
  },

  // ---- iPad ----
  {
    id: "ipad-pro",
    category: "iPad",
    name: "iPad Pro",
    chip: "M5",
    fromPrice: "$999",
    releasedOn: "2025-10-16",
    avgCycleDays: 509,
    note: "M5 chip with custom N1 networking — well inside its usual ~17-month cycle, no refresh expected soon.",
    amazonUrl: amazonSearchUrl("Apple iPad Pro M5"),
    appleUrl: rakutenAppleUrl("/shop/buy-ipad/ipad-pro"),
  },
  {
    id: "ipad-air",
    category: "iPad",
    name: "iPad Air",
    chip: "M4",
    fromPrice: "$599",
    releasedOn: "2026-03-04",
    avgCycleDays: 578,
    note: "Just refreshed with M4 and 12GB of memory — the freshest iPad you can buy right now.",
    amazonUrl: amazonSearchUrl("Apple iPad Air M4"),
    appleUrl: rakutenAppleUrl("/shop/buy-ipad/ipad-air"),
  },
  {
    id: "ipad",
    category: "iPad",
    name: "iPad (11th gen)",
    chip: "A16",
    fromPrice: "$349",
    releasedOn: "2025-03-02",
    avgCycleDays: 484,
    note: "Past its typical refresh window — the entry-level iPad is due for an update.",
    amazonUrl: amazonSearchUrl("Apple iPad A16"),
    appleUrl: rakutenAppleUrl("/shop/buy-ipad/ipad"),
  },
  {
    id: "ipad-mini",
    category: "iPad",
    name: "iPad mini",
    chip: "A17 Pro",
    fromPrice: "$499",
    releasedOn: "2024-10-22",
    avgCycleDays: 665,
    note: "Nearing the end of its historical cycle — worth checking for a newer generation before buying.",
    amazonUrl: amazonSearchUrl("Apple iPad mini"),
    appleUrl: rakutenAppleUrl("/shop/buy-ipad/ipad-mini"),
  },

  // ---- Vision Pro ----
  {
    id: "vision-pro",
    category: "Vision Pro",
    name: "Apple Vision Pro",
    chip: "M5",
    fromPrice: "$3,499",
    releasedOn: "2025-10-16",
    avgCycleDays: 635,
    note: "Refreshed with the M5 chip alongside the iPad Pro — mid-cycle, no successor expected for a while.",
    amazonUrl: amazonSearchUrl("Apple Vision Pro M5"),
    appleUrl: rakutenAppleUrl("/shop/buy-vision/apple-vision-pro"),
  },

  // ---- Smart Home & TV ----
  {
    id: "apple-tv",
    category: "Smart Home & TV",
    name: "Apple TV 4K",
    chip: "A15 Bionic",
    fromPrice: "$129",
    releasedOn: "2022-10-20",
    avgCycleDays: 738,
    note: "Nearly four years since its last update and well past Apple's usual cycle for this device — a strong candidate to sit out until a refresh lands.",
    amazonUrl: amazonSearchUrl("Apple TV 4K"),
    appleUrl: rakutenAppleUrl("/shop/buy-tv-home-entertainment/apple-tv-4k"),
  },
  {
    id: "homepod",
    category: "Smart Home & TV",
    name: "HomePod",
    chip: "S7",
    fromPrice: "$299",
    releasedOn: "2023-01-20",
    avgCycleDays: 1818,
    note: "Apple only ships a new HomePod generation every few years, so this one still has room left — but it's edging toward the second half of that cycle.",
    amazonUrl: amazonSearchUrl("Apple HomePod"),
    appleUrl: rakutenAppleUrl("/shop/buy-homepod/homepod"),
  },
  {
    id: "homepod-mini",
    category: "Smart Home & TV",
    name: "HomePod mini",
    chip: "S5",
    fromPrice: "$99",
    releasedOn: "2020-11-16",
    avgCycleDays: 1500,
    note: "Unchanged since its 2020 debut — the oldest active product in Apple's lineup and overdue for a successor by any measure.",
    amazonUrl: amazonSearchUrl("Apple HomePod mini"),
    appleUrl: rakutenAppleUrl("/shop/buy-homepod/homepod-mini"),
  },
  {
    id: "airtag",
    category: "Smart Home & TV",
    name: "AirTag",
    chip: "U2",
    fromPrice: "$29",
    releasedOn: "2026-01-26",
    avgCycleDays: 1739,
    note: "Just updated with extended range and a louder speaker — Apple only revisits AirTag every few years, so this is an easy buy.",
    amazonUrl: amazonSearchUrl("Apple AirTag"),
    appleUrl: rakutenAppleUrl("/shop/buy-accessories/airtag"),
  },
];

export type Verdict = { label: string; tone: "buy" | "caution" | "dont-buy" };

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(`${iso}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function formatAge(days: number): string {
  if (days < 60) return `${days} days ago`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `${months} months ago`;
  return `${(days / 365.25).toFixed(1)} years ago`;
}

export function getVerdict(product: AppleProduct): Verdict {
  if (product.discontinued) return { label: "Don't buy — discontinued", tone: "dont-buy" };

  const ratio = daysSince(product.releasedOn) / product.avgCycleDays;
  if (ratio >= 0.85) return { label: "Wait — refresh likely imminent", tone: "dont-buy" };
  if (ratio >= 0.6) return { label: "Caution — nearing next refresh", tone: "caution" };
  return { label: "Buy now — recently updated", tone: "buy" };
}
