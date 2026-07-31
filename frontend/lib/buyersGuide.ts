// Shared core for every brand's Buyers Guide (/buyers-guide) — the
// product-agnostic types, date math, and verdict logic. Brand-specific
// product data and affiliate IDs live in their own files
// (macBuyersGuide.ts, googleBuyersGuide.ts, ...) and get combined in
// buyersGuideRegistry.ts. Keeping this part shared means a third brand's
// guide only needs a new data file, not a second copy of this logic.

export type Verdict = { label: string; tone: "buy" | "caution" | "dont-buy" };

export type GuideProduct = {
  id: string;
  category: string;
  name: string;
  chip: string;
  fromPrice: string;
  releasedOn: string; // ISO date of the current model's launch
  avgCycleDays: number; // historical average days between refreshes for this line
  discontinued?: boolean;
  // A *confirmed* announcement/refresh date (not a rumor) — when set and
  // coming up soon, this overrides the cycle-ratio verdict below with a
  // more precise "wait" call than the historical average alone can give.
  nextEventOn?: string;
  note: string;
  // Not sold on Amazon at all (e.g. a discontinued, refurb-only product) omits this.
  amazonUrl?: string;
  storeUrl: string; // the brand's own store, via its affiliate network — every product has this one
};

export type GuideConfig = {
  storeName: string; // "Apple" | "Google" — used for card CTAs and metadata
  heading: string;
  dek: string;
  disclosureNote: string;
  categoryOrder: string[];
  products: GuideProduct[];
};

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(`${iso}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function daysUntil(iso: string): number {
  const ms = new Date(`${iso}T00:00:00Z`).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function formatAge(days: number): string {
  if (days < 60) return `${days} days ago`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `${months} months ago`;
  return `${(days / 365.25).toFixed(1)} years ago`;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Confirmed-event window: inside 45 days of a known announcement date, the
// "wait" call is precise enough to name the date rather than lean on the
// cycle-ratio heuristic below.
const CONFIRMED_EVENT_WINDOW_DAYS = 45;

export function getVerdict(product: GuideProduct): Verdict {
  if (product.discontinued) return { label: "Don't buy — discontinued", tone: "dont-buy" };

  if (product.nextEventOn) {
    const until = daysUntil(product.nextEventOn);
    if (until <= CONFIRMED_EVENT_WINDOW_DAYS) {
      const when = until <= 0 ? "any day now" : `on ${formatDate(product.nextEventOn)}`;
      return { label: `Wait — next model launches ${when}`, tone: "dont-buy" };
    }
  }

  const ratio = daysSince(product.releasedOn) / product.avgCycleDays;
  if (ratio >= 0.85) return { label: "Wait — refresh likely imminent", tone: "dont-buy" };
  if (ratio >= 0.6) return { label: "Caution — nearing next refresh", tone: "caution" };
  return { label: "Buy now — recently updated", tone: "buy" };
}

export function amazonSearchUrl(tag: string, query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${tag}`;
}

export function rakutenDeepUrl(affiliateId: string, merchantId: string, destUrl: string): string {
  return `https://click.linksynergy.com/deeplink?id=${affiliateId}&mid=${merchantId}&murl=${encodeURIComponent(destUrl)}`;
}

export function awinDeepUrl(affiliateId: string, advertiserId: string, destUrl: string): string {
  return `https://www.awin1.com/cread.php?awinmid=${advertiserId}&awinaffid=${affiliateId}&ued=${encodeURIComponent(destUrl)}`;
}
