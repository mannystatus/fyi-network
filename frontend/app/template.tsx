import Link from "next/link";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import FlyNowNavbar from "../components/FlyNowNavbar";
import FlyNowTitlebar from "../components/FlyNowTitlebar";
import ThemeToggle from "../components/ThemeToggle";
import NewsNotifications from "../components/NewsNotifications";
import SearchBox from "../components/SearchBox";
import SendTipForm from "../components/SendTipForm";
import CookieSettingsLink from "../components/CookieSettingsLink";
import AdSlot from "../components/AdSlot";
import ChromeGate from "../components/ChromeGate";
import { AD_SLOTS } from "../lib/analytics";
import { BUYERS_GUIDES } from "../lib/buyersGuideRegistry";
import GameDaySoftPrompt from "../components/GameDaySoftPrompt";

// Brands whose decorative top titlebar (chrome-bar / cros-titlebar /
// netflix-titlebar / dodgers-titlebar / lakers-titlebar) has room to host
// the search/bell/theme icons directly, instead of the nav-bar-inner row
// below. ACTIONS_MOVED additionally take the "fyi network" switcher up
// there too — for those, .header-actions in nav-bar-inner is left empty
// (or, for dodgers/lakers, repurposed for the score line that used to live
// in the titlebar before the icons took its spot).
const ICONS_MOVED = new Set(["mac", "google", "netflix", "dodgers", "lakers"]);
const ACTIONS_MOVED = new Set(["netflix", "dodgers", "lakers"]);

export default async function Template({ children }: { children: React.ReactNode }) {
  const [brand, brands] = await Promise.all([getCurrentBrand(), getAllBrands()]);
  const suffix = brand.name.replace("fyi", "");

  // Only fyiFlyNow's homepage ever needs to hide the shared chrome, so every
  // other brand can skip the client-side route check entirely.
  if (brand.icon !== "flynow") {
    return <Chrome brand={brand} brands={brands} suffix={suffix}>{children}</Chrome>;
  }

  return (
    <ChromeGate bare={children}>
      <Chrome brand={brand} brands={brands} suffix={suffix}>
        {children}
      </Chrome>
    </ChromeGate>
  );
}

async function Chrome({
  brand,
  brands,
  suffix,
  children,
}: {
  brand: Awaited<ReturnType<typeof getCurrentBrand>>;
  brands: Awaited<ReturnType<typeof getAllBrands>>;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`browser-frame theme-${brand.icon}`}>
      {brand.icon === "win" && (
        <div className="win-titlebar">
          <div className="win-logo">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="win-title">{brand.name}</div>
          <div className="win-controls">
            <button aria-label="Minimize">&#8211;</button>
            <button aria-label="Maximize">&#9633;</button>
            <button className="win-close" aria-label="Close">
              &#10005;
            </button>
          </div>
        </div>
      )}

      {brand.icon === "google" && (
        <div className="cros-titlebar">
          <div className="cros-tab">
            <span className="favicon" />
            {brand.name}
            <span className="close-x">&#10005;</span>
          </div>
          <div className="cros-omnibox">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {brand.domain}
          </div>
          <div className="cros-titlebar-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <ThemeToggle />
          </div>
        </div>
      )}

      {brand.icon === "netflix" && (
        <div className="netflix-titlebar">
          <div className="netflix-logo">N</div>
          <div className="netflix-title">{brand.name}</div>
          <div className="netflix-titlebar-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <ThemeToggle />
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>
      )}

      {brand.icon === "lakers" && (
        <div className="lakers-titlebar">
          <div className="lakers-jersey">
            <span className="lakers-badge">LAL</span>
            <span className="lakers-name">LAKERS</span>
          </div>
          <div className="lakers-titlebar-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <ThemeToggle />
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>
      )}

      {brand.icon === "dodgers" && (
        <div className="dodgers-titlebar">
          <div className="dodgers-jersey">
            <span className="dodgers-badge">LAD</span>
            <span className="dodgers-name">DODGERS</span>
          </div>
          <div className="dodgers-titlebar-actions">
            <SearchBox />
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <ThemeToggle />
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>
      )}

      {brand.icon === "flynow" && (
        <FlyNowTitlebar domain={brand.domain} brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
      )}

      <div id="site" className={`theme-${brand.icon}`}>
        {brand.icon === "mac" && (
          <div className="chrome-bar">
            <span className="chrome-dot" style={{ background: "var(--red)" }} />
            <span className="chrome-dot" style={{ background: "var(--yellow)" }} />
            <span className="chrome-dot" style={{ background: "var(--green)" }} />
            <div className="chrome-bar-actions">
              <SearchBox />
              <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
              <ThemeToggle />
            </div>
          </div>
        )}

        {brand.icon === "flynow" ? (
          <FlyNowNavbar brands={brands} currentSlug={brand.slug} />
        ) : (
          <header className="nav-bar">
            <div className="nav-bar-inner">
              <div className="wordmark-col">
                <Link href="/" className="wordmark" aria-label={`${brand.name} home`}>
                  fyi
                  <span className="suffix">{suffix}</span>
                  {brand.icon === "mac" && <span className="cursor" />}
                </Link>
                {brand.tagline && <p className="tagline">{brand.tagline}</p>}
              </div>

              {brand.topics.length > 0 && (
                <TopicsNav
                  topics={brand.topics}
                  extra={
                    BUYERS_GUIDES[brand.slug] && (
                      <Link href="/buyers-guide" className="topic-link topic-link-guide">
                        📘 Buyers Guide
                      </Link>
                    )
                  }
                />
              )}

              <div className="header-actions">
                {!ICONS_MOVED.has(brand.icon) && (
                  <>
                    <SearchBox />
                    <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
                    <ThemeToggle />
                  </>
                )}
                {!ACTIONS_MOVED.has(brand.icon) && <DomainSwitcher brands={brands} currentSlug={brand.slug} />}
              </div>
            </div>
          </header>
        )}

        {brand.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.image_url} alt="" className="brand-banner" />
        )}

        <div className="ad-slot-wrap">
          <AdSlot slot={AD_SLOTS.header} />
        </div>

        <main>{children}</main>

        <footer>
          <span>&copy; fyi -m-w-g-n</span>
          <span className="footer-links">
            <SendTipForm brandName={brand.name} />
            {BUYERS_GUIDES[brand.slug] && <Link href="/buyers-guide">Buyers Guide</Link>}
            <Link href="/advertise">Advertise</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <CookieSettingsLink />
            <span>{brand.domain}</span>
          </span>
        </footer>
      </div>

      {brand.icon === "dodgers" && <GameDaySoftPrompt brandSlug={brand.slug} teamName="fyiDodgers" />}
      {brand.icon === "lakers" && <GameDaySoftPrompt brandSlug={brand.slug} teamName="fyiLakers" />}
    </div>
  );
}
