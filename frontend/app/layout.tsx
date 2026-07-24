import Link from "next/link";
import "./globals.css";
import { getCurrentBrand, getAllBrands } from "../lib/api";
import DomainSwitcher from "../components/DomainSwitcher";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [brand, brands] = await Promise.all([getCurrentBrand(), getAllBrands()]);
  const suffix = brand.name.replace("fyi", "");

  return (
    <html lang="en">
      <body style={{ "--accent": brand.accent_color } as React.CSSProperties}>
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
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {brand.domain}
              </div>
            </div>
          )}

          <div id="site" className={`theme-${brand.icon}`}>
            {brand.icon === "mac" && (
              <div className="chrome-bar">
                <span className="chrome-dot" style={{ background: "var(--red)" }} />
                <span className="chrome-dot" style={{ background: "var(--yellow)" }} />
                <span className="chrome-dot" style={{ background: "var(--green)" }} />
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--comment)" }}>
                  fyi &mdash; terminal
                </span>
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
              <DomainSwitcher brands={brands} currentSlug={brand.slug} />
            </div>

            {brand.topics.length > 0 && (
              <nav className="topics-nav">
                <Link href="/" className="topic-pill">
                  All
                </Link>
                {brand.topics.map((topic) => (
                  <Link key={topic} href={`/topics/${encodeURIComponent(topic)}`} className="topic-pill">
                    {topic}
                  </Link>
                ))}
              </nav>
            )}

            <main>{children}</main>

            <footer>
              <span>&copy; fyi-mac-win-google</span>
              <span>{brand.domain}</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
