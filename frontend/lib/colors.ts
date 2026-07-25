// Curated colors for the topics we ship with, so the feed reads as more
// than one uniform blue label. Anything not in this list (a topic added
// later via a brand's `topics` column) still gets a distinct, stable color
// via a cheap string hash — nothing here needs updating for that to work.
const PALETTE: Record<string, string> = {
  Mac: "#a78bfa",
  iPhone: "#fb7185",
  iPad: "#38bdf8",
  "Apple Watch": "#34d399",
  Services: "#fbbf24",
  "Windows 11": "#60a5fa",
  Hardware: "#fb923c",
  Copilot: "#c084fc",
  Pixel: "#4ade80",
  Chrome: "#facc15",
  Android: "#a3e635",

  // fyiFlyNow's topics — pinned to its navy/sky/coral/amber palette instead
  // of the hash fallback, which was landing on off-brand purple/pink hues.
  "Flight Deals": "#FFB627",
  "Airline News": "#4FC3FF",
  "Travel Tips": "#FF6B4A",
};

export function categoryColor(name: string | null | undefined): string {
  if (!name) return "var(--blue)";
  if (PALETTE[name]) return PALETTE[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${hash}, 70%, 65%)`;
}
