// Finds the first markdown image in an article body, if any, so a custom
// banner (e.g. the fyiMac digital-movies article) becomes the share-preview
// image instead of the brand's generic OG fallback.
//
// SVGs are skipped: most link-unfurl crawlers (iMessage, WhatsApp, SMS,
// Twitter/X) don't render SVG for og:image/twitter:image at all, so using
// one here would silently break the preview instead of improving it. The
// caller falls back to the brand's PNG when this returns null.
const MD_IMAGE = /!\[[^\]]*\]\((\S+?)\)/g;

export function extractFirstImageUrl(bodyMd: string, domain: string): string | null {
  for (const match of bodyMd.matchAll(MD_IMAGE)) {
    const src = match[1];
    if (/\.svg(\?.*)?$/i.test(src)) continue;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    return `https://${domain}${src.startsWith("/") ? "" : "/"}${src}`;
  }
  return null;
}
