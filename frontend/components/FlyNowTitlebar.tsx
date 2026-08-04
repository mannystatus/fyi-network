import SearchBox from "./SearchBox";

// Shared between the bare homepage and every other fyiFlyNow page (via
// template.tsx's Chrome), same reasoning as FlyNowNavbar — one definition so
// the two can't drift.
//
// No ThemeToggle here: the departure-board look is fixed dark navy
// everywhere on this brand (see globals.css's theme-flynow-body rules), so a
// light/dark toggle would have no visible effect.
export default function FlyNowTitlebar({
  domain,
}: {
  domain: string;
  brandSlug: string;
  brandName: string;
  topics: string[];
}) {
  return (
    <div className="flynow-titlebar">
      <div className="flynow-status">
        <span className="flynow-dot" />
        Now boarding &middot; {domain}
      </div>
      <div className="flynow-titlebar-actions">
        <SearchBox />
      </div>
    </div>
  );
}
