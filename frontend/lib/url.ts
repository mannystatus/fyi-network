// Brand.domain is stored bare (e.g. "fyimac.com"), but the bare apex
// 308-redirects to the www subdomain (see backend/app/main.py's CORS
// comment) — www is the URL that actually serves the page. Canonical tags,
// og:url, JSON-LD @id, and sitemap/robots URLs all need to point at that
// final URL rather than one that immediately redirects elsewhere, or
// crawlers flag it (Search Console: "Page with redirect").
export function canonicalDomain(domain: string): string {
  return `www.${domain}`;
}

export function canonicalOrigin(domain: string): string {
  return `https://${canonicalDomain(domain)}`;
}
