"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Brand } from "../lib/api";
import DomainSwitcher from "./DomainSwitcher";

// Shared between the bare homepage (app/components/FlyNowHomepage.tsx) and
// every other fyiFlyNow page (rendered via app/template.tsx's Chrome), so the
// two never drift the way the homepage's bespoke nav and the generic
// site-header/TopicsNav combo used to.
const NAV_LINKS = [
  { label: "Flight Deals", href: "/topics/Flight%20Deals" },
  { label: "Airline News", href: "/topics/Airline%20News" },
  { label: "Travel Tips", href: "/topics/Travel%20Tips" },
  { label: "Travel Guides", href: "/topics/Travel%20Guides" },
  { label: "Advisories", href: "/travel-advisories" },
];

export default function FlyNowNavbar({ brands, currentSlug }: { brands: Brand[]; currentSlug: string }) {
  const pathname = usePathname();

  return (
    <header className="flynow-site-nav">
      <div className="flynow-site-nav-inner">
        <Link href="/" className="flynow-logo" aria-label="fyiFlyNow home" prefetch={false}>
          <span className="flynow-flap-nav sky">f</span>
          <span className="flynow-flap-nav sky">y</span>
          <span className="flynow-flap-nav sky">i</span>
          <span className="flynow-flap-nav coral">F</span>
          <span className="flynow-flap-nav coral">l</span>
          <span className="flynow-flap-nav coral">y</span>
          <span className="flynow-flap-nav amber">N</span>
          <span className="flynow-flap-nav amber">o</span>
          <span className="flynow-flap-nav amber">w</span>
        </Link>
        <nav className="flynow-nav-links">
          <Link href="/#blog" prefetch={false}>
            Blog
          </Link>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname === decodeURIComponent(link.href);
            return (
              <Link key={link.href} href={link.href} data-active={active} prefetch={false}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <DomainSwitcher brands={brands} currentSlug={currentSlug} />
      </div>
    </header>
  );
}
