// Curated colors for the topics we ship with, so the feed reads as more
// than one uniform blue label. Anything not in this list (a topic added
// later via a brand's `topics` column) still gets a distinct, stable color
// via a cheap string hash — nothing here needs updating for that to work.
//
// Each entry is a CSS var, not a literal hex — the var has a light-mode
// override in globals.css (darker/more saturated, same hue) so labels stay
// readable on a white background instead of washing out like the raw
// dark-mode pastel would. Using a var (rather than picking the hex here
// based on theme) means it stays correct if the user flips the ThemeToggle
// client-side, since that only swaps a CSS attribute — it doesn't re-render
// already-mounted article lists to recompute a literal color.
const PALETTE: Record<string, string> = {
  Mac: "var(--cat-mac)",
  iPhone: "var(--cat-iphone)",
  iPad: "var(--cat-ipad)",
  "Apple Watch": "var(--cat-apple-watch)",
  Services: "var(--cat-services)",
  "Windows 11": "var(--cat-windows-11)",
  Hardware: "var(--cat-hardware)",
  Copilot: "var(--cat-copilot)",
  Pixel: "var(--cat-pixel)",
  Chrome: "var(--cat-chrome)",
  Android: "var(--cat-android)",

  // fyiFlyNow's topics — pinned to its navy/sky/coral/amber palette instead
  // of the hash fallback, which was landing on off-brand purple/pink hues.
  "Flight Deals": "var(--cat-flight-deals)",
  "Airline News": "var(--cat-airline-news)",
  "Travel Tips": "var(--cat-travel-tips)",
};

export function categoryColor(name: string | null | undefined): string {
  if (!name) return "var(--blue)";
  if (PALETTE[name]) return PALETTE[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  // --cat-fallback-s/-l get darkened in light mode (see globals.css) for
  // the same reason the named PALETTE entries above use vars instead of
  // literal hex.
  return `hsl(${hash}, var(--cat-fallback-s, 70%), var(--cat-fallback-l, 65%))`;
}
