import Link from "next/link";
import type { Brand } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";
import NetworkFooterLinks from "./NetworkFooterLinks";

// Used both on the bespoke homepage and, via template.tsx's Chrome, on
// every other page for this brand (articles, topics, search, etc.) — the
// generic <footer> that used to be the only thing inner pages got still
// renders right below this (SendTipForm, Buyers Guide, Advertise, Terms,
// Privacy, CookieSettingsLink), just trimmed to a slim utility row now that
// this covers the branding/nav part.
export default function EditorialFooter({
  brand,
  brands,
  config,
}: {
  brand: Brand;
  brands: Brand[];
  config: EditorialConfig;
}) {
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
            <NetworkFooterLinks brands={brands} currentSlug={brand.slug} />
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
