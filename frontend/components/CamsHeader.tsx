"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Brand } from "../lib/api";
import DomainSwitcher from "./DomainSwitcher";
import SearchBox from "./SearchBox";
import NewsNotifications from "./NewsNotifications";
import CamsLogoMark from "./CamsLogoMark";

// Shared between the bare homepage (CamsHomepage.tsx) and every other
// fyiCams page (rendered via app/template.tsx's Chrome) — same reasoning as
// FlyNowTitlebar/FlyNowNavbar, one definition so the two can't drift.
const TICKER_ITEMS = [
  { tag: "Rumor", text: "Next-gen full-frame sensor said to enter mass production Q1" },
  { tag: "Firmware", text: "Eye-AF update rolling out to three camera lines this week" },
  { tag: "Price Drop", text: "Popular 35mm prime down 18% at major retailers" },
  { tag: "Rumor", text: "Compact rangefinder-style body spotted in patent filing" },
  { tag: "Score", text: "Budget prime lens scores 9.1 — our highest this quarter" },
  { tag: "Firmware", text: "Subject-detection AF mode added via free update" },
];

// Anchors, not real routes — Compare/Rumors/Video/Deals are homepage
// sections for v1 (see the add-brand plan's backend-scope note); Reviews
// has its own small index page since CAMS_REVIEWS may hold more than one.
const NAV_LINKS = [
  { label: "Latest", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "Rumors", href: "/#rumor-mill" },
  { label: "Compare", href: "/#compare" },
  { label: "Video", href: "/#video" },
  { label: "Deals", href: "/#deals" },
];

export default function CamsHeader({ brand, brands }: { brand: Brand; brands: Brand[] }) {
  const pathname = usePathname();

  return (
    <>
      <div className="cams-ticker">
        <div className="cams-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span className="cams-ticker-item" key={i}>
              <span className="cams-ticker-tag">{t.tag}</span>
              {t.text}
            </span>
          ))}
        </div>
      </div>

      <header className="cams-masthead">
        <div className="cams-masthead-inner">
          <Link href="/" className="cams-wordmark-link" aria-label={`${brand.name} home`} prefetch={false}>
            <CamsLogoMark size={30} />
            <span>
              <span className="cams-wordmark">{brand.name}</span>
              <span className="cams-wordmark-sub">{brand.tagline}</span>
            </span>
          </Link>
          <nav className="cams-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-active={pathname === link.href || (link.href === "/reviews" && pathname.startsWith("/reviews"))}
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/from-us" className="cams-nav-fromus" data-active={pathname === "/from-us"} prefetch={false}>
              Latest from {brand.name}
            </Link>
          </nav>
          <div className="cams-masthead-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <a className="cams-subscribe-btn" href="/#newsletter">
              Subscribe
            </a>
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>
      </header>
    </>
  );
}
