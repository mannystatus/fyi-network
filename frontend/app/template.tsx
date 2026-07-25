import Link from "next/link";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import ThemeToggle from "../components/ThemeToggle";
import NewsNotifications from "../components/NewsNotifications";
import SendTipForm from "../components/SendTipForm";
import AdSlot from "../components/AdSlot";
import ChromeGate from "../components/ChromeGate";
import { AD_SLOTS } from "../lib/analytics";

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

function Chrome({
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
      {brand.icon === "mac" && (
        <div className="browser-chrome">
          <span className="dot" style={{ background: "#f7768e" }} />
          <span className="dot" style={{ background: "#e0af68" }} />
          <span className="dot" style={{ background: "#9ece6a" }} />
          <div className="urlbar">{brand.domain}</div>
        </div>
      )}

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
        </div>
      )}

      {brand.icon === "netflix" && (
        <div className="netflix-titlebar">
          <div className="netflix-logo">N</div>
          <div className="netflix-title">{brand.name}</div>
        </div>
      )}

      {brand.icon === "flynow" && (
        <div className="flynow-titlebar">
          <div className="flynow-flaps">
            {["f", "y", "i"].map((ch, i) => (
              <span key={`s${i}`} className="flynow-flap sky">
                {ch}
              </span>
            ))}
            {["F", "l", "y"].map((ch, i) => (
              <span key={`c${i}`} className="flynow-flap coral">
                {ch}
              </span>
            ))}
            {["N", "o", "w"].map((ch, i) => (
              <span key={`a${i}`} className="flynow-flap amber">
                {ch}
              </span>
            ))}
          </div>
          <div className="flynow-status">
            <span className="flynow-dot" />
            Now boarding &middot; {brand.domain}
          </div>
        </div>
      )}

      <div id="site" className={`theme-${brand.icon}`}>
        {brand.icon === "mac" && (
          <div className="chrome-bar">
            <span className="chrome-dot" style={{ background: "var(--red)" }} />
            <span className="chrome-dot" style={{ background: "var(--yellow)" }} />
            <span className="chrome-dot" style={{ background: "var(--green)" }} />
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--comment)" }}>fyi &mdash; terminal</span>
          </div>
        )}

        <div className="site-header">
          <div>
            <div className="wordmark">
              fyi
              <span className="suffix">{suffix}</span>
              {brand.icon === "mac" && <span className="cursor" />}
            </div>
            <div className="tagline">{brand.tagline}</div>
          </div>
          <div className="header-actions">
            <NewsNotifications brandSlug={brand.slug} brandName={brand.name} topics={brand.topics} />
            <ThemeToggle />
            <DomainSwitcher brands={brands} currentSlug={brand.slug} />
          </div>
        </div>

        {brand.topics.length > 0 && <TopicsNav topics={brand.topics} />}

        <div className="ad-slot-wrap">
          <AdSlot slot={AD_SLOTS.header} />
        </div>

        <main>{children}</main>

        <footer>
          <span>&copy; fyi -m-w-g-n</span>
          <span className="footer-links">
            <SendTipForm brandName={brand.name} />
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <span>{brand.domain}</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
