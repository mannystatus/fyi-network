import Link from "next/link";
import CamsLogoMark from "./CamsLogoMark";

// Shared between the bare homepage and every other fyiCams page, same
// reasoning as CamsHeader.
export default function CamsFooter({ brandName }: { brandName: string }) {
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
            <a href="mailto:tips@fyicams.com?subject=Contact">Contact</a>
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
