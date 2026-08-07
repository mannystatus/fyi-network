"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Brand } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";
import DomainSwitcher from "./DomainSwitcher";
import SearchBox from "./SearchBox";
import NewsNotifications from "./NewsNotifications";
import ThemeToggle from "./ThemeToggle";
import TopicsNav from "./TopicsNav";
import { BUYERS_GUIDES } from "../lib/buyersGuideRegistry";

// Shared ticker + sticky masthead for fyiMac/fyiWin/fyiGoogle/fyiNetflix —
// used both inside each brand's bespoke homepage and via app/template.tsx's
// Chrome for every other page, same dual-use pattern as CamsHeader/
// FlyNowTitlebar.

const RAINBOW = ["#61BB46", "#FDB827", "#F5821F", "#E03A3E", "#963D97", "#0071BC"];
const FOURBAR = ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];

function SignatureMark({ kind }: { kind: EditorialConfig["signatureMark"] }) {
  if (!kind) return null;
  const bars = kind === "rainbow" ? RAINBOW : FOURBAR;
  return (
    <span className="editorial-signature-mark">
      {bars.map((c, i) => (
        <span key={i} style={{ background: c }} />
      ))}
    </span>
  );
}

export default function EditorialHeader({
  brand,
  brands,
  config,
}: {
  brand: Brand;
  brands: Brand[];
  config: EditorialConfig;
}) {
  const pathname = usePathname();
  const suffix = brand.name.replace("fyi", "");

  // No Article is ever categorized "Reviews" (see ingest_news.py's
  // category=topic), so for brands using this auto-assembled nav, "Reviews"
  // and navLastLabel ("Deals") point at the closest real stand-in: the
  // Buyers Guide's buy/wait verdicts where one exists, else the Quick
  // Compare table. Two differently-labeled nav items landing on the same
  // page is intentional here, not a bug — there's nothing else real to
  // point to. (fyiNetflix opts out of this via its own navItems override —
  // it has real review content via the "Staff Reviews" topic pill instead.)
  const buyGuideOrCompareHref = BUYERS_GUIDES[brand.slug] ? "/buyers-guide" : config.showCompare ? "/#compare" : "/";

  const navLinks = [
    ...(config.navItems ?? [
      { label: "News", href: "/news" },
      {
        label: config.navSecondaryLabel,
        href: config.rumorsTopic ? `/topics/${encodeURIComponent(config.rumorsTopic)}` : "/#rumor-mill",
      },
      { label: "Reviews", href: buyGuideOrCompareHref },
      ...(config.showCompare ? [{ label: "Compare", href: "/#compare" }] : []),
      {
        label: config.navLastLabel,
        href: config.navLastLabel === "New This Week" ? "/#news-grid" : buyGuideOrCompareHref,
      },
    ]),
    ...(config.extraNavItems ?? []),
  ];

  // Topics promoted into extraNavItems (e.g. fyiMac's Apple TV+/Services)
  // shouldn't also show up as pills in the topics row below.
  const promotedLabels = new Set((config.extraNavItems ?? []).map((item) => item.label));
  const pillTopics = brand.topics.filter((t) => !promotedLabels.has(t));

  return (
    <>
      <div className="editorial-ticker">
        <div className="editorial-ticker-track">
          {[...config.ticker, ...config.ticker].map((t, i) => (
            <span className="editorial-ticker-item" key={i}>
              <span className="editorial-ticker-tag">{t.tag}</span>
              {t.text}
            </span>
          ))}
        </div>
      </div>

      <header className="editorial-masthead">
        <div className="editorial-masthead-inner">
          <div className="editorial-wordmark-col">
            <Link href="/" className="editorial-wordmark" aria-label={`${brand.name} home`} prefetch={false}>
              fyi
              <span>{suffix}</span>
            </Link>
            <SignatureMark kind={config.signatureMark} />
          </div>
          <nav className="editorial-nav">
            {navLinks.map((link, i) => (
              <Link key={`${link.label}-${i}`} href={link.href} data-active={pathname === link.href} prefetch={false}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="editorial-masthead-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            {/* fyiNetflix has no light variant (fixed dark, like fyiFlyNow) —
                showing a toggle with no visible effect would be the exact
                misleading-toggle bug already fixed for fyiFlyNow earlier. */}
            {config.mode !== "dark" && <ThemeToggle />}
            <a className="editorial-subscribe-btn" href="/#newsletter">
              Subscribe
            </a>
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>

        {/* Real per-brand topic browsing (K-Drama, Xbox/PC Gaming, Buyers
            Guide, etc.) — dropped when this masthead replaced the old
            generic nav-bar's <TopicsNav>, restored here as a second row so
            the fixed mockup nav above doesn't have to fake it. */}
        {pillTopics.length > 0 && (
          <div className="editorial-topics-row">
            <TopicsNav
              topics={pillTopics}
              extra={
                <>
                  <Link href="/from-us" className="topic-link topic-link-fromus" prefetch={false}>
                    📰 Latest from {brand.name}
                  </Link>
                  {BUYERS_GUIDES[brand.slug] && (
                    <Link href="/buyers-guide" className="topic-link topic-link-guide" prefetch={false}>
                      📘 Buyers Guide
                    </Link>
                  )}
                </>
              }
            />
          </div>
        )}
      </header>
    </>
  );
}
