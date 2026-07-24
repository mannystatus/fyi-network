import Link from "next/link";
import Script from "next/script";
import { cookies } from "next/headers";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import ThemeToggle from "../components/ThemeToggle";
import NewsNotifications from "../components/NewsNotifications";
import CookieBanner from "../components/CookieBanner";
import { GTM_IDS, GA_IDS, ADSENSE_CLIENT_ID } from "../lib/analytics";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [brand, brands, cookieStore] = await Promise.all([getCurrentBrand(), getAllBrands(), cookies()]);
  const suffix = brand.name.replace("fyi", "");

  const themeCookie = cookieStore.get("theme")?.value;
  const htmlThemeProps = themeCookie === "light" || themeCookie === "dark" ? { "data-theme": themeCookie } : {};
  const cookieConsented = cookieStore.get("cookie-consent")?.value === "accepted";
  const gtmId = GTM_IDS[brand.slug];
  const gaId = GA_IDS[brand.slug];

  return (
    <html lang="en" {...htmlThemeProps}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <body style={{ "--accent": brand.accent_color } as React.CSSProperties}>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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

        <CookieBanner initiallyDismissed={cookieConsented} />
      </body>
    </html>
  );
}
