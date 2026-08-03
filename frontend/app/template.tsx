import Link from "next/link";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import FlyNowNavbar from "../components/FlyNowNavbar";
import FlyNowTitlebar from "../components/FlyNowTitlebar";
import CamsHeader from "../components/CamsHeader";
import EditorialHeader from "../components/EditorialHeader";
import { EDITORIAL_CONFIGS } from "../lib/editorialConfig";
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

// Brands whose homepage is a fully bespoke component (FlyNowHomepage,
// CamsHomepage, EditorialHomepage) that supplies its own header/footer and
// skips the shared #site chrome entirely — everywhere else on these brands
// (articles, etc.) still goes through the normal Chrome below.
const BARE_HOMEPAGE_BRANDS = new Set(["flynow", "cams", "mac", "win", "google", "netflix", "lakers", "dodgers"]);

export default async function Template({ children }: { children: React.ReactNode }) {
  const [brand, brands] = await Promise.all([getCurrentBrand(), getAllBrands()]);
  const suffix = brand.name.replace("fyi", "");

  // Only these brands' homepages ever need to hide the shared chrome, so
  // every other brand can skip the client-side route check entirely.
  if (!BARE_HOMEPAGE_BRANDS.has(brand.icon)) {
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
      {EDITORIAL_CONFIGS[brand.icon] && (
        <EditorialHeader brand={brand} brands={brands} config={EDITORIAL_CONFIGS[brand.icon]} />
      )}

      {brand.icon === "flynow" && (
        <FlyNowTitlebar domain={brand.domain} brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
      )}
      {brand.icon === "cams" && <CamsHeader brand={brand} brands={brands} />}

      <div id="site" className={`theme-${brand.icon}`}>
        {brand.icon === "flynow" ? (
          <FlyNowNavbar brands={brands} currentSlug={brand.slug} />
        ) : brand.icon === "cams" || EDITORIAL_CONFIGS[brand.icon] ? null : (
          // Every current brand now has its own bespoke titlebar/masthead
          // (FlyNow/Cams/the editorial-template brands above), so this
          // fallback is unreached today — kept as the default starting
          // chrome for the next brand added without a bespoke redesign yet
          // (this is literally what fyiMac/Win/Google/Netflix/Lakers/
          // Dodgers all looked like before they got one).
          <header className="nav-bar">
            <div className="nav-bar-inner">
              <div className="wordmark-col">
                <Link href="/" className="wordmark" aria-label={`${brand.name} home`} prefetch={false}>
                  fyi
                  <span className="suffix">{suffix}</span>
                </Link>
                {brand.tagline && <p className="tagline">{brand.tagline}</p>}
              </div>

              {brand.topics.length > 0 && (
                <TopicsNav
                  topics={brand.topics}
                  extra={
                    BUYERS_GUIDES[brand.slug] && (
                      <Link href="/buyers-guide" className="topic-link topic-link-guide" prefetch={false}>
                        📘 Buyers Guide
                      </Link>
                    )
                  }
                />
              )}

              <div className="header-actions">
                <SearchBox />
                <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
                <ThemeToggle />
                <DomainSwitcher brands={brands} currentSlug={brand.slug} />
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
