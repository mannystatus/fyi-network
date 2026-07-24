import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = "/Users/mannyc/Downloads/fyi-network/frontend/public/og";

const W = 1200;
const H = 630;
const MONO = `'SF Mono', Menlo, Consolas, 'Courier New', monospace`;

const APPLE_PATH = `M 30 -2 C 30 -14 20 -18 14 -18 C 10 -18 6 -15 3 -15 C 0 -15 -5 -18 -10 -18 C -18 -18 -26 -12 -26 0 C -26 14 -18 32 -10 32 C -6 32 -4 30 1 30 C 6 30 8 32 13 32 C 20 32 26 20 29 12 C 20 8 19 -4 30 -2 Z
M 8 -20 C 8 -25 12 -30 17 -31 C 18 -25 14 -20 8 -20 Z`;

function logoGlyph(icon) {
  const cx = 1030;
  const cy = 300;
  if (icon === "mac") {
    return `<g transform="translate(${cx},${cy}) scale(4.2)" fill="#e8e8ed"><path d="${APPLE_PATH}"/></g>`;
  }
  if (icon === "google") {
    // Matches Google's brand palette, arranged as a 2x2 tile mark.
    const s = 64, gap = 10;
    const x0 = cx - s - gap / 2, y0 = cy - s - gap / 2;
    return `
      <rect x="${x0}" y="${y0}" width="${s}" height="${s}" rx="10" fill="#34a853"/>
      <rect x="${x0 + s + gap}" y="${y0}" width="${s}" height="${s}" rx="10" fill="#4285f4"/>
      <rect x="${x0}" y="${y0 + s + gap}" width="${s}" height="${s}" rx="10" fill="#fbbc05"/>
      <rect x="${x0 + s + gap}" y="${y0 + s + gap}" width="${s}" height="${s}" rx="10" fill="#ea4335"/>
    `;
  }
  if (icon === "win") {
    const s = 64, gap = 10;
    const x0 = cx - s - gap / 2, y0 = cy - s - gap / 2;
    return `
      <rect x="${x0}" y="${y0}" width="${s}" height="${s}" rx="4" fill="#0078d4"/>
      <rect x="${x0 + s + gap}" y="${y0}" width="${s}" height="${s}" rx="4" fill="#00b7c3"/>
      <rect x="${x0}" y="${y0 + s + gap}" width="${s}" height="${s}" rx="4" fill="#8764b8"/>
      <rect x="${x0 + s + gap}" y="${y0 + s + gap}" width="${s}" height="${s}" rx="4" fill="#7fba00"/>
    `;
  }
  // netflix — same bold serif "N" the live site renders in .netflix-logo
  return `<text x="${cx}" y="${cy + 60}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="800" font-size="200" fill="#e50914" letter-spacing="-6">N</text>`;
}

function bannerSvg({ suffix, tagline, icon }) {
  const wordmarkSize = 88;
  const charW = wordmarkSize * 0.6; // monospace advance width
  const wordmarkX = 152;
  const cursorX = wordmarkX + (3 + suffix.length) * charW + 8;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#1a1b26"/>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#2a2e42" stroke-width="2"/>
  <rect x="0" y="0" width="${W}" height="64" fill="#16161e"/>
  <line x1="0" y1="64" x2="${W}" y2="64" stroke="#2a2e42" stroke-width="2"/>
  <circle cx="40" cy="32" r="9" fill="#f7768e"/>
  <circle cx="66" cy="32" r="9" fill="#e0af68"/>
  <circle cx="92" cy="32" r="9" fill="#9ece6a"/>
  <text x="${W / 2}" y="38" text-anchor="middle" font-family="${MONO}" font-size="15" fill="#565f89">fyi &#8212; terminal</text>

  <text x="80" y="360" font-family="${MONO}" font-size="${wordmarkSize}" fill="#9ece6a">&#10095;</text>
  <text x="${wordmarkX}" y="360" font-family="${MONO}" font-size="${wordmarkSize}" fill="#c0caf5">fyi<tspan fill="#e8e8ed" font-weight="700">${suffix}</tspan></text>
  <rect x="${cursorX}" y="298" width="34" height="70" fill="#e8e8ed" opacity="0.9"/>
  <text x="82" y="430" font-family="${MONO}" font-size="26" fill="#565f89">\$ echo "${tagline}"</text>

  ${logoGlyph(icon)}
</svg>`;
}

const BRANDS = [
  { slug: "fyimac", suffix: "Mac", icon: "mac", tagline: "Apple news. Decoded daily." },
  { slug: "fyiwin", suffix: "Win", icon: "win", tagline: "Windows news. Decoded daily." },
  { slug: "fyigoogle", suffix: "Google", icon: "google", tagline: "Google news. Decoded daily." },
  { slug: "fyinetflix", suffix: "Netflix", icon: "netflix", tagline: "Netflix news. Decoded daily." },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const brand of BRANDS) {
  const svg = bannerSvg(brand);
  await sharp(Buffer.from(svg)).png().toFile(join(OUT_DIR, `${brand.slug}.png`));
  console.log(`wrote ${brand.slug}.png`);
}
