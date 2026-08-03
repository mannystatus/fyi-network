import Link from "next/link";
import type { Brand } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";
import { EXTERNAL_SITES } from "../lib/externalSites";

// Used both on the bespoke homepage and, via template.tsx's Chrome, on
// every other page for this brand (articles, topics, search, etc.) — the
// generic <footer> that used to be the only thing inner pages got still
// renders right below this (SendTipForm, Buyers Guide, Advertise, Terms,
// Privacy, CookieSettingsLink), just trimmed to a slim utility row now that
// this covers the branding/nav part.
export default function EditorialFooter({ brand, config }: { brand: Brand; config: EditorialConfig }) {
  const suffix = brand.name.replace("fyi", "");
  const year = new Date().getFullYear();

  return (
    <footer className="editorial-footer">
      <div className="editorial-footer-inner">
        <span className="editorial-footer-wordmark">
          fyi
          <span>{suffix}</span>
        </span>
        <div className="editorial-footer-cols">
          <div>
            <h5>Coverage</h5>
            <Link href="/">News</Link>
            <Link href="/#rumor-mill">{config.navSecondaryLabel}</Link>
            {config.showCompare && <Link href="/#compare">Compare</Link>}
          </div>
          <div>
            <h5>Network</h5>
            {config.networkLinks.map((n) => (
              <a key={n} href={`https://${n.toLowerCase()}.com`}>
                {n}
              </a>
            ))}
            {/* Part of the fyi family but outside the Brand system (see
                lib/externalSites.ts) — same registry DomainSwitcher and
                /advertise already pull from, so this can't drift out of
                sync with those. */}
            {EXTERNAL_SITES.map((site) => (
              <a key={site.url} href={site.url} target="_blank" rel="noopener noreferrer">
                {site.name}.com
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="editorial-footer-bottom">
        <span>
          © {year} {brand.name}. Part of the fyi network. Independently reported.
        </span>
        <span>{config.disclaimer}</span>
      </div>
    </footer>
  );
}
