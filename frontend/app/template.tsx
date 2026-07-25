import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";
import TopicsNav from "../components/TopicsNav";
import ThemeToggle from "../components/ThemeToggle";
import NewsNotifications from "../components/NewsNotifications";
import AdSlot from "../components/AdSlot";
import { AD_SLOTS } from "../lib/analytics";

// Unlike layout.tsx, Next.js re-mounts template.tsx on every navigation —
// including client-side transitions between sibling pages — which is what
// this needs: fyiFlyNow's homepage is the only route that skips the shared
// browser-frame chrome, and that decision depends on the *current* pathname,
// which a persisted layout would only ever evaluate once (see layout.tsx).
export default async function Template({ children }: { children: React.ReactNode }) {
  const [brand, brands, h] = await Promise.all([getCurrentBrand(), getAllBrands(), headers()]);
  const suffix = brand.name.replace("fyi", "");
  const isFlynowHome = brand.icon === "flynow" && h.get("x-pathname") === "/";

  if (isFlynowHome) {
    return <>{children}</>;
  }

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
            <a href={`mailto:tips@${brand.domain}?subject=${encodeURIComponent(`Tip for ${brand.name}`)}`}>
              Send us a tip
            </a>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <span>{brand.domain}</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
