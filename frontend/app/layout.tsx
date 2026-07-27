import Script from "next/script";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Archivo_Black, Space_Grotesk, Inter, Oswald } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getCurrentBrand } from "../lib/api";
import CookieBanner from "../components/CookieBanner";
import { GTM_IDS, GA_IDS, ADSENSE_CLIENT_ID, SWG_PRODUCT_IDS } from "../lib/analytics";

// Only fyiFlyNow's theme references these (via --font-flynow-*) — self-hosted
// by next/font so there's no extra external request for the other brands.
const flynowDisplay = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-flynow-display" });
const flynowBody = Space_Grotesk({ weight: "500", subsets: ["latin"], variable: "--font-flynow-body" });
const flynowSans = Inter({ weight: ["300", "400", "500", "600"], subsets: ["latin"], variable: "--font-flynow-sans" });

// Only fyiLakers references this (via --font-lakers-display) — condensed
// bold caps to match the "fyi LAKERS" logo lockup's headline lettering.
const lakersDisplay = Oswald({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-lakers-display" });

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
  const cookieConsented = cookieStore.get("cookie-consent")?.value === "accepted";
  const gtmId = GTM_IDS[brand.slug];
  const gaId = GA_IDS[brand.slug];
  const swgProductId = SWG_PRODUCT_IDS[brand.slug];

  return (
    <html lang="en" {...htmlThemeProps}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <body
        className={`${flynowDisplay.variable} ${flynowBody.variable} ${flynowSans.variable} ${lakersDisplay.variable} ${
          brand.icon === "flynow" ? "theme-flynow-body" : ""
        }`}
        style={{ "--accent": brand.accent_color } as React.CSSProperties}
      >
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

        <CookieBanner initiallyDismissed={cookieConsented} />
      </body>
    </html>
  );
}
