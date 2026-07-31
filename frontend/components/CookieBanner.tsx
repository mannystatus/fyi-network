"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

type Consent = "accepted" | "rejected";

// Reopened via CookieSettingsLink in the footer, since GDPR expects
// withdrawing consent to be as easy as giving it.
const REOPEN_EVENT = "open-cookie-preferences";

export default function CookieBanner({ initialConsent }: { initialConsent: Consent | null }) {
  const [dismissed, setDismissed] = useState(initialConsent !== null);

  useEffect(() => {
    function reopen() {
      setDismissed(false);
    }
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  if (dismissed) return null;

  function choose(consent: Consent) {
    document.cookie = `cookie-consent=${consent}; path=/; max-age=31536000; samesite=lax`;
    const granted = consent === "accepted";
    // GA/GTM support live consent updates via gtag, but AdSense's
    // restricted-data-processing flag doesn't: pushing it again here throws
    // "All 'ins' elements ... already have ads in them" once AdSlot has
    // already filled a unit on this page (adsbygoogle can't retarget an
    // already-served ad anyway). It's set once, before any ins fills, by
    // the beforeInteractive script in layout.tsx computed from this same
    // cookie — the new value takes effect starting next page load.
    window.gtag?.("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
    setDismissed(true);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
      <div className="cookie-box">
        <div className="cookie-text">
          <p className="cookie-title">🍪 We use cookies</p>
          <p>
            This site uses a couple of first-party cookies to remember your theme and which network site
            you&apos;re on, and works with Google Analytics and AdSense, which may use cookies for analytics and
            to show personalized ads. See our <Link href="/privacy">Privacy Policy</Link> for details.
          </p>
        </div>
        <div className="cookie-actions">
          <button type="button" className="cookie-reject" onClick={() => choose("rejected")}>
            Reject
          </button>
          <button type="button" className="cookie-accept" onClick={() => choose("accepted")}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export { REOPEN_EVENT };
