"use client";

import { useState } from "react";
import type { Brand } from "../lib/api";
import { canonicalOrigin } from "../lib/url";
import { EXTERNAL_SITES } from "../lib/externalSites";

const ICONS: Record<Brand["icon"], string> = {
  mac: "",   // apple glyph fallback (renders as-is if font lacks it; harmless)
  win: "▦",
  google: "●",
  netflix: "▶",
  flynow: "✈",
  lakers: "🏀",
  dodgers: "⚾",
};

export default function DomainSwitcher({
  brands,
  currentSlug,
}: {
  brands: Brand[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);

  function targetUrlFor(brand: Brand): string {
    if (typeof window === "undefined") return canonicalOrigin(brand.domain);
    const isDev = window.location.hostname.endsWith("localhost");
    if (isDev) {
      return `${window.location.protocol}//${brand.slug}.localhost:${window.location.port}/`;
    }
    return `${canonicalOrigin(brand.domain)}/`;
  }

  return (
    <div className="switcher">
      <button
        className="switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="switcher-dot" />
        fyi network
        <span className="chevron">{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <ul className="switcher-menu" role="listbox">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <a
                href={targetUrlFor(brand)}
                className="brand-opt"
                style={{ color: brand.slug === currentSlug ? brand.accent_color : undefined }}
              >
                <span className="icon" style={{ color: brand.accent_color }} aria-hidden>
                  {ICONS[brand.icon]}
                </span>
                {brand.name}
                {brand.slug === currentSlug && <span className="current-tag">current</span>}
              </a>
            </li>
          ))}
          <li className="switcher-divider" role="separator" />
          {/* Opens in a new tab since it's leaving this app. */}
          {EXTERNAL_SITES.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="brand-opt" target="_blank" rel="noopener noreferrer">
                <span className="icon" aria-hidden>
                  ↗
                </span>
                {link.name}
                <span className="current-tag">external</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
