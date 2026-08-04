import type { Brand } from "../lib/api";
import { EXTERNAL_SITES } from "../lib/externalSites";

// Single source for every brand's footer "Network" column — reads the same
// `brands` list DomainSwitcher already gets from getAllBrands(), so a new
// brand or a domain change shows up here automatically instead of needing
// a hand-edited list per brand (EditorialFooter/CamsFooter/FlyNowHomepage
// each kept their own copy before this, and they'd already drifted once).
export default function NetworkFooterLinks({ brands, currentSlug }: { brands: Brand[]; currentSlug: string }) {
  return (
    <>
      {brands
        .filter((b) => b.slug !== currentSlug)
        .map((b) => (
          <a key={b.slug} href={`https://${b.domain}`}>
            {b.name}
          </a>
        ))}
      {EXTERNAL_SITES.map((site) => (
        <a key={site.url} href={site.url} target="_blank" rel="noopener noreferrer">
          {site.name}.com
        </a>
      ))}
    </>
  );
}
