import Link from "next/link";
import type { Brand } from "../lib/api";
import type { EditorialConfig } from "../lib/editorialConfig";

// Homepage-only footer (mirrors CamsFooter/FlyNowHomepage's own footer) —
// inner pages keep the existing shared generic <footer> in template.tsx's
// Chrome (SendTipForm, Buyers Guide, Advertise, Terms, Privacy,
// CookieSettingsLink), just re-themed via CSS, so those stay reachable.
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
