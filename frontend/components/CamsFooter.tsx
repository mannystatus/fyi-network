import Link from "next/link";
import type { Brand } from "../lib/api";
import CamsLogoMark from "./CamsLogoMark";
import NetworkFooterLinks from "./NetworkFooterLinks";

// Shared between the bare homepage and every other fyiCams page, same
// reasoning as CamsHeader.
export default function CamsFooter({ brand, brands }: { brand: Brand; brands: Brand[] }) {
  const brandName = brand.name;
  const year = new Date().getFullYear();
  return (
    <footer className="cams-footer">
      <div className="cams-footer-inner">
        <div className="cams-footer-brand">
          <CamsLogoMark size={24} />
          {brandName}
        </div>
        <div className="cams-footer-cols">
          <div className="cams-footer-col">
            <h5>Coverage</h5>
            <Link href="/">Latest</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/#rumor-mill">Rumors</Link>
            <Link href="/#deals">Deals</Link>
          </div>
          <div className="cams-footer-col">
            <h5>Community</h5>
            <a href="/#podcast">Podcast</a>
            <a href="https://www.youtube.com/@fyicams" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            <Link href="/advertise">Contact / Advertising</Link>
          </div>
          <div className="cams-footer-col">
            <h5>Network</h5>
            <NetworkFooterLinks brands={brands} currentSlug={brand.slug} />
          </div>
          <div className="cams-footer-col">
            <h5>About</h5>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
      <div className="cams-footer-bottom">
        <span>© {year} {brandName}. Part of the fyi network.</span>
        <span>Independently reported. Sponsored placements clearly labeled.</span>
      </div>
    </footer>
  );
}
