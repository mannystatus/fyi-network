import Link from "next/link";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import FlyNowNavbar from "../components/FlyNowNavbar";
import FlyNowTitlebar from "../components/FlyNowTitlebar";
import CamsHeader from "../components/CamsHeader";
import CamsFooter from "../components/CamsFooter";
import EditorialHeader from "../components/EditorialHeader";
import EditorialFooter from "../components/EditorialFooter";
import NetworkFooterLinks from "../components/NetworkFooterLinks";
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
  const hasBespokeFooter = brand.icon !== "flynow" && (!!EDITORIAL_CONFIGS[brand.icon] || brand.icon === "cams");

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
          <FlyNowNavbar brands={brands} currentSlug={brand.slug} brandName={brand.name} />
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
                    <>
                      <Link href="/from-us" className="topic-link topic-link-fromus" prefetch={false}>
                        📰 Latest from {brand.name}
                      </Link>
                      {BUYERS_GUIDES[brand.slug] && (
                        <Link href="/buyers-guide" className="topic-link topic-link-guide" prefetch={false}>
                          📘 Buyers Guide
                        </Link>
                      )}
                    </>
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

        {/* Every inner page (articles, topics, search, etc.) used to end in
            just the plain utility footer below — the branded footer only
            ever showed up on each brand's bespoke homepage. That made every
            non-homepage page read as the old pre-redesign site. fyiFlyNow
            never got a bespoke inner-page footer of its own, so it keeps
            using the utility footer everywhere — that row now also carries
            its Network links (below), so it isn't the one brand missing
            them on every page but the homepage. */}
        {brand.icon !== "flynow" && EDITORIAL_CONFIGS[brand.icon] && (
          <EditorialFooter brand={brand} brands={brands} config={EDITORIAL_CONFIGS[brand.icon]} />
        )}
        {brand.icon === "cams" && <CamsFooter brand={brand} brands={brands} />}

        <footer className={hasBespokeFooter ? "utility-footer" : undefined}>
          {!hasBespokeFooter && <span>&copy; fyi -m-w-g-n</span>}
          <span className="footer-links">
            <SendTipForm brandName={brand.name} />
            {BUYERS_GUIDES[brand.slug] && <Link href="/buyers-guide">Buyers Guide</Link>}
            <Link href="/advertise">Advertise</Link>
            {brand.icon === "flynow" && <NetworkFooterLinks brands={brands} currentSlug={brand.slug} />}
            {/* CamsFooter's own "About" column already links Terms/Privacy —
                skip the duplicate here, everyone else's bespoke footer
                (or, for fyiFlyNow, no bespoke footer at all) doesn't have them. */}
            {brand.icon !== "cams" && <Link href="/terms">Terms</Link>}
            {brand.icon !== "cams" && <Link href="/privacy">Privacy</Link>}
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
