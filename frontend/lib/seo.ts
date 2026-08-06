import type { Brand } from "./api";

// Meta keywords carry near-zero weight with Google itself (ignored since
// ~2009) but still get read by Bing and some vertical search engines, and
// doubling this list as the source for each page's JSON-LD `keywords` /
// `articleSection` gives real crawlers (not just the meta tag) a topical
// signal. Brand.topics is the closest thing this site has to a tag
// taxonomy — every article's `category` is one exact entry from it — so
// building the list from "this page's own term(s) first, then every
// sibling topic, then the brand name" surfaces the specific match up front
// without losing the brand-wide topic coverage.
export function buildKeywords(brand: Pick<Brand, "name" | "topics">, extra: Array<string | null | undefined> = []): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const add = (term: string | null | undefined) => {
    if (!term) return;
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(term);
  };

  for (const term of extra) add(term);
  for (const topic of brand.topics) add(topic);
  add(brand.name);

  return ordered;
}
