import SearchBox from "./SearchBox";
import NewsNotifications from "./NewsNotifications";
import ThemeToggle from "./ThemeToggle";

// Shared between the bare homepage and every other fyiFlyNow page (via
// template.tsx's Chrome), same reasoning as FlyNowNavbar — one definition so
// the two can't drift.
export default function FlyNowTitlebar({
  domain,
  brandSlug,
  brandName,
  topics,
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
        <NewsNotifications brandSlug={brandSlug} brandName={brandName} topics={topics} />
        <ThemeToggle />
      </div>
    </div>
  );
}
