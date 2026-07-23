"use client";

import { useState } from "react";
import type { Brand } from "../lib/api";

const ICONS: Record<Brand["icon"], string> = {
  mac: "\uF8FF",   // apple glyph fallback (renders as-is if font lacks it; harmless)
  win: "▦",
  google: "●",
};

/**
 * Renders every brand in the network and lets the visitor jump to any of them.
 * Switching always lands on that brand's homepage rather than the same slug —
 * each brand has its own independent article set, so "the same URL on another
 * domain" usually wouldn't resolve to anything. This keeps the switch honest.
 */
export default function DomainSwitcher({
  brands,
  currentSlug,
}: {
  brands: Brand[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);

  function targetUrlFor(brand: Brand): string {
    if (typeof window === "undefined") return `https://${brand.domain}`;
    const isDev = window.location.hostname.endsWith("localhost");
    if (isDev) {
      return `${window.location.protocol}//${brand.slug}.localhost:${window.location.port}/`;
    }
    return `https://${brand.domain}/`;
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
        fyi-mac-win-google
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
        </ul>
      )}
    </div>
  );
}
