// Generates favicon/app-icon PNGs (public/icons/{slug}-512.png,
// {slug}-180.png) and the OG/Twitter share-preview PNG (public/og/{slug}.png)
// for sites that have their own per-site "Brand Kit.dc.html" — a distinct
// wordmark/color identity per brand, as opposed to the shared dark-terminal
// template in generate-og-banners.mjs (which the other, not-yet-kitted fyi
// sites still use).
//
// Renders via a headless browser rather than sharp+SVG because the kits use
// Oswald/IBM Plex Mono (Google Fonts) — sharp's SVG rasterizer only sees
// locally-installed fonts, so it can't reproduce them; a real browser can
// load web fonts like the kit previews themselves do.
//
// Colors/layout are lifted directly from each brand's "Brand Kit.dc.html"
// (sections 01 "Primary lockup" and 02 "Icon fallback"). Add a brand kit's
// hex values as a new BRANDS entry to extend this to the remaining
// fyiFlyNow/fyiLakers/fyiDodgers/fyiCams sites once they get their own kits.
//
// Usage: node scripts/generate-brand-kit-assets.mjs

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const OG_DIR = path.join(__dirname, "..", "public", "og");

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet">
`;

const BRANDS = [
  {
    slug: "fyigoogle",
    letter: "G",
    iconBg: "#34A853",
    ogBg: "#202124",
    wordmarkColor: "#F8F9FA",
    badgeBg: "#34A853",
    badgeColor: "#fff",
    tagline: "Google news. Decoded daily.",
    taglineColor: "#80868B",
    suffix: "Google",
    stripe: null,
  },
  {
    slug: "fyimac",
    letter: "M",
    iconBg: "#0071E3",
    ogBg: "#1D1D1F",
    wordmarkColor: "#F5F5F7",
    badgeBg: "#0071E3",
    badgeColor: "#fff",
    tagline: "Apple news. Decoded daily.",
    taglineColor: "#86868B",
    suffix: "Mac",
    stripe: ["#61BB46", "#FDB827", "#F5821F", "#E03A3E", "#963D97", "#0071BC"],
  },
  {
    slug: "fyinetflix",
    letter: "N",
    iconBg: "#D81F26",
    ogBg: "#141414",
    wordmarkColor: "#F5F5F5",
    badgeBg: "#D81F26",
    badgeColor: "#fff",
    tagline: "Netflix news. Decoded daily.",
    taglineColor: "#8A8A8A",
    suffix: "Netflix",
    stripe: null,
  },
  {
    slug: "fyiwin",
    letter: "W",
    iconBg: "#0067C0",
    ogBg: "#1B1B1F",
    wordmarkColor: "#F3F6FB",
    badgeBg: "#0067C0",
    badgeColor: "#fff",
    tagline: "Windows news. Decoded daily.",
    taglineColor: "#8892A0",
    suffix: "Win",
    stripe: ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"],
  },
];

function iconHtml(b, size) {
  const fontSize = Math.round(size * 0.44);
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
  <style>*{margin:0;padding:0;} html,body{width:${size}px;height:${size}px;}
  .box{width:${size}px;height:${size}px;background:${b.iconBg};display:flex;align-items:center;justify-content:center;}
  .letter{font-family:'Oswald',sans-serif;font-weight:700;font-size:${fontSize}px;color:#fff;line-height:1;}
  </style></head><body><div class="box"><span class="letter">${b.letter}</span></div></body></html>`;
}

function stripeHtml(colors, segW, segH, gap) {
  return colors
    .map((c) => `<span style="width:${segW}px;height:${segH}px;background:${c};display:inline-block;"></span>`)
    .join(`<span style="width:${gap}px;display:inline-block;"></span>`);
}

function ogHtml(b) {
  const W = 1200, H = 630;
  const stripeBlock = b.stripe
    ? `<div style="margin-top:24px;display:flex;">${stripeHtml(b.stripe, 34, 10, 4)}</div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
  <style>*{margin:0;padding:0;box-sizing:border-box;} html,body{width:${W}px;height:${H}px;background:${b.ogBg};}
  .wrap{width:${W}px;height:${H}px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;}
  .word{font-weight:700;font-size:84px;text-transform:uppercase;color:${b.wordmarkColor};display:flex;align-items:center;line-height:1;}
  .badge{background:${b.badgeBg};color:${b.badgeColor};padding:6px 26px;margin-left:6px;}
  .tag{margin-top:34px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:24px;color:${b.taglineColor};}
  </style></head><body>
  <div class="wrap">
    <div class="word">fyi<span class="badge">${b.suffix}</span></div>
    ${stripeBlock}
    <div class="tag">${b.tagline}</div>
  </div>
  </body></html>`;
}

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(OG_DIR, { recursive: true });

const browser = await chromium.launch();

for (const b of BRANDS) {
  for (const size of [512, 180]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(iconHtml(b, size), { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ICONS_DIR, `${b.slug}-${size}.png`) });
    await page.close();
  }

  const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await ogPage.setContent(ogHtml(b), { waitUntil: "networkidle" });
  await ogPage.screenshot({ path: path.join(OG_DIR, `${b.slug}.png`) });
  await ogPage.close();

  console.log(`wrote ${b.slug}-512.png, ${b.slug}-180.png, og/${b.slug}.png`);
}

await browser.close();
