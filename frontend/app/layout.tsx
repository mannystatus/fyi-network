import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Archivo_Black, Space_Grotesk, Inter } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import ThemeToggle from "../components/ThemeToggle";
import NewsNotifications from "../components/NewsNotifications";
import CookieBanner from "../components/CookieBanner";
import AdSlot from "../components/AdSlot";
import { GTM_IDS, GA_IDS, ADSENSE_CLIENT_ID, AD_SLOTS } from "../lib/analytics";

// Only fyiFlyNow's theme references these (via --font-flynow-*) — self-hosted
// by next/font so there's no extra external request for the other brands.
const flynowDisplay = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-flynow-display" });
const flynowBody = Space_Grotesk({ weight: "500", subsets: ["latin"], variable: "--font-flynow-body" });
const flynowSans = Inter({ weight: ["300", "400", "500", "600"], subsets: ["latin"], variable: "--font-flynow-sans" });

// A plain <meta> tag has no JS dependency, unlike next/script's adsbygoogle
// loader (which Next only ever injects client-side, even with
// strategy="beforeInteractive") — AdSense's non-JS-executing verifier can
// only find this one.
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const brandSlug = h.get("x-brand-slug") || "fyimac";
  const brand = await getCurrentBrand();
  const logoUrl = `/icons/${brandSlug}-512.png`;
  const bannerUrl = `/og/${brandSlug}.png`;

  return {
    metadataBase: new URL(`https://${brand.domain}`),
    title: { default: brand.name, template: `%s | ${brand.name}` },
    description: brand.tagline,
    other: { "google-adsense-account": ADSENSE_CLIENT_ID },
    icons: {
      icon: logoUrl,
      apple: `/icons/${brandSlug}-180.png`,
    },
    openGraph: {
      title: brand.name,
      description: brand.tagline,
      url: `https://${brand.domain}`,
      siteName: brand.name,
      images: [{ url: bannerUrl, width: 1200, height: 630, alt: `${brand.name} banner` }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: brand.name,
      description: brand.tagline,
      images: [bannerUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [brand, brands, cookieStore, h] = await Promise.all([
    getCurrentBrand(),
    getAllBrands(),
    cookies(),
    headers(),
  ]);
  const suffix = brand.name.replace("fyi", "");

  const themeCookie = cookieStore.get("theme")?.value;
  const htmlThemeProps = themeCookie === "light" || themeCookie === "dark" ? { "data-theme": themeCookie } : {};
  const cookieConsented = cookieStore.get("cookie-consent")?.value === "accepted";
  const gtmId = GTM_IDS[brand.slug];
  const gaId = GA_IDS[brand.slug];
  // fyiFlyNow's homepage is a bespoke full-bleed design that supplies its own
  // nav/footer — it skips the shared browser-frame chrome entirely. Every
  // other route on the domain (privacy, terms, articles) keeps it.
  const isFlynowHome = brand.icon === "flynow" && h.get("x-pathname") === "/";

  return (
    <html lang="en" {...htmlThemeProps}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <body
        className={`${flynowDisplay.variable} ${flynowBody.variable} ${flynowSans.variable}`}
        style={{ "--accent": brand.accent_color } as React.CSSProperties}
      >
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {isFlynowHome ? (
          children
        ) : (
        <div className={`browser-frame theme-${brand.icon}`}>
          {brand.icon === "mac" && (
            <div className="browser-chrome">
              <span className="dot" style={{ background: "#f7768e" }} />
              <span className="dot" style={{ background: "#e0af68" }} />
              <span className="dot" style={{ background: "#9ece6a" }} />
              <div className="urlbar">{brand.domain}</div>
            </div>
          )}

          {brand.icon === "win" && (
            <div className="win-titlebar">
              <div className="win-logo">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="win-title">{brand.name}</div>
              <div className="win-controls">
                <button aria-label="Minimize">&#8211;</button>
                <button aria-label="Maximize">&#9633;</button>
                <button className="win-close" aria-label="Close">
                  &#10005;
                </button>
              </div>
            </div>
          )}

          {brand.icon === "google" && (
            <div className="cros-titlebar">
              <div className="cros-tab">
                <span className="favicon" />
                {brand.name}
                <span className="close-x">&#10005;</span>
              </div>
              <div className="cros-omnibox">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {brand.domain}
              </div>
            </div>
          )}

          {brand.icon === "netflix" && (
            <div className="netflix-titlebar">
              <div className="netflix-logo">N</div>
              <div className="netflix-title">{brand.name}</div>
            </div>
          )}

          {brand.icon === "flynow" && (
            <div className="flynow-titlebar">
              <div className="flynow-flaps">
                {["f", "y", "i"].map((ch, i) => (
                  <span key={`s${i}`} className="flynow-flap sky">
                    {ch}
                  </span>
                ))}
                {["F", "l", "y"].map((ch, i) => (
                  <span key={`c${i}`} className="flynow-flap coral">
                    {ch}
                  </span>
                ))}
                {["N", "o", "w"].map((ch, i) => (
                  <span key={`a${i}`} className="flynow-flap amber">
                    {ch}
                  </span>
                ))}
              </div>
              <div className="flynow-status">
                <span className="flynow-dot" />
                Now boarding &middot; {brand.domain}
              </div>
            </div>
          )}

          <div id="site" className={`theme-${brand.icon}`}>
            {brand.icon === "mac" && (
              <div className="chrome-bar">
                <span className="chrome-dot" style={{ background: "var(--red)" }} />
                <span className="chrome-dot" style={{ background: "var(--yellow)" }} />
                <span className="chrome-dot" style={{ background: "var(--green)" }} />
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--comment)" }}>
                  fyi &mdash; terminal
                </span>
              </div>
            )}

            <div className="site-header">
              <div>
                <div className="wordmark">
                  fyi
                  <span className="suffix">{suffix}</span>
                  {brand.icon === "mac" && <span className="cursor" />}
                </div>
                <div className="tagline">{brand.tagline}</div>
              </div>
              <div className="header-actions">
                <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
                <ThemeToggle />
                <DomainSwitcher brands={brands} currentSlug={brand.slug} />
              </div>
            </div>

            {brand.topics.length > 0 && <TopicsNav topics={brand.topics} />}

            <div className="ad-slot-wrap">
              <AdSlot slot={AD_SLOTS.header} />
            </div>

            <main>{children}</main>

            <footer>
              <span>&copy; fyi -m-w-g-n</span>
              <span className="footer-links">
                <a href={`mailto:tips@${brand.domain}?subject=${encodeURIComponent(`Tip for ${brand.name}`)}`}>
                  Send us a tip
                </a>
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
                <span>{brand.domain}</span>
              </span>
            </footer>
          </div>
        </div>
        )}

        <CookieBanner initiallyDismissed={cookieConsented} />
      </body>
    </html>
  );
}
