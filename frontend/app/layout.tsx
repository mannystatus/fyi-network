import Script from "next/script";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Archivo_Black, Space_Grotesk, Inter, Oswald, Newsreader, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getCurrentBrand } from "../lib/api";
import CookieBanner from "../components/CookieBanner";
import { GTM_IDS, GA_IDS, ADSENSE_CLIENT_ID, SWG_PRODUCT_IDS } from "../lib/analytics";
import { canonicalOrigin } from "../lib/url";

// Only fyiFlyNow's theme references these (via --font-flynow-*) — self-hosted
// by next/font so there's no extra external request for the other brands.
// preload:false on all four below — next/font otherwise emits a <link
// rel=preload> for every one of these on every brand's pages regardless of
// whether that brand's theme CSS ever references the variable (confirmed via
// a production build: fyiwin/fyimac were fetching all 4 woff2 files, ~78KiB,
// for fonts their CSS never uses). preload:false stops the eager fetch; the
// font still loads normally, on demand, wherever its CSS variable actually
// gets used (fyiFlyNow, fyiLakers/fyiDodgers).
const flynowDisplay = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-flynow-display",
  preload: false,
});
const flynowBody = Space_Grotesk({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-flynow-body",
  preload: false,
});
const flynowSans = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-flynow-sans",
  preload: false,
});

// Shared by every sports-team brand (fyiLakers, fyiDodgers, ...) via
// --font-sports-display — condensed bold caps matching each one's
// "fyi <TEAM>" logo lockup lettering. One shared font load rather than a
// per-brand Oswald instance, since it's the same typeface for all of them.
const sportsDisplay = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sports-display",
  preload: false,
});

// fyiCams's editorial type system — Newsreader for headlines (with the
// italic emphasis word the design uses in the hero), Work Sans for body/UI,
// IBM Plex Mono for data labels/scores/tags and the wordmark itself.
const camsDisplay = Newsreader({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cams-display",
  preload: false,
});
const camsBody = Work_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cams-body",
  preload: false,
});
const camsMono = IBM_Plex_Mono({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cams-mono",
  preload: false,
});

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
    metadataBase: new URL(canonicalOrigin(brand.domain)),
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
      url: canonicalOrigin(brand.domain),
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

// Deliberately minimal: this stays mounted across client-side navigation
// between sibling pages (Next.js does not remount layouts on navigation,
// unlike template.tsx), so anything here that depends on the *current*
// route rather than just the brand would go stale after the first
// navigation. The browser-frame chrome (which does depend on the current
// route, for fyiFlyNow's homepage) lives in app/template.tsx instead,
// which Next.js re-runs on every navigation.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [brand, cookieStore] = await Promise.all([getCurrentBrand(), cookies()]);

  const themeCookie = cookieStore.get("theme")?.value;
  const htmlThemeProps = themeCookie === "light" || themeCookie === "dark" ? { "data-theme": themeCookie } : {};
  const consentCookie = cookieStore.get("cookie-consent")?.value;
  const consent: "accepted" | "rejected" | null =
    consentCookie === "accepted" || consentCookie === "rejected" ? consentCookie : null;
  const adsGranted = consent === "accepted";
  const gtmId = GTM_IDS[brand.slug];
  const gaId = GA_IDS[brand.slug];
  const swgProductId = SWG_PRODUCT_IDS[brand.slug];

  return (
    <html lang="en" {...htmlThemeProps}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <body
        className={`${flynowDisplay.variable} ${flynowBody.variable} ${flynowSans.variable} ${sportsDisplay.variable} ${camsDisplay.variable} ${camsBody.variable} ${camsMono.variable} ${
          brand.icon === "flynow" ? "theme-flynow-body" : ""
        }`}
        style={{ "--accent": brand.accent_color } as React.CSSProperties}
      >
        {/* Google Consent Mode v2 default, set before AdSense (just below) so
            it never fires with granted storage ahead of an explicit user
            choice — required for EEA/UK traffic under Google's EU User
            Consent Policy. Mirrors the cookie set by CookieBanner's
            accept/reject handlers, so a returning visitor's choice applies
            from the very first paint instead of defaulting to denied again
            on every page load.
            Deliberately a child of <body>, not <html> — <script> isn't a
            valid child of <html> (only <head>/<body> are), and a
            beforeInteractive Script renders literally in the initial HTML
            (unlike GTM/GA above, which default to afterInteractive and get
            injected post-hydration instead), so placing it under <html>
            got silently reparented by the browser's HTML parser and broke
            hydration (React error #418) — killing every click handler on
            the page, including this banner's own Accept/Reject buttons. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: '${adsGranted ? "granted" : "denied"}',
              ad_user_data: '${adsGranted ? "granted" : "denied"}',
              ad_personalization: '${adsGranted ? "granted" : "denied"}',
              analytics_storage: '${adsGranted ? "granted" : "denied"}'
            });
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({ google_ad_client: '${ADSENSE_CLIENT_ID}', google_restrict_data_processing: ${!adsGranted} });`}
        </Script>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        {swgProductId && (
          <>
            <Script
              async
              src="https://news.google.com/swg/js/v1/swg-basic.js"
              strategy="beforeInteractive"
            />
            <Script id="swg-basic-init" strategy="beforeInteractive">
              {`(self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
                basicSubscriptions.init({
                  type: "NewsArticle",
                  isPartOfType: ["Product"],
                  isPartOfProductId: "${swgProductId}",
                  clientOptions: { theme: "light", lang: "en" },
                });
              });`}
            </Script>
          </>
        )}

        {children}

        <CookieBanner initialConsent={consent} />
      </body>
    </html>
  );
}
