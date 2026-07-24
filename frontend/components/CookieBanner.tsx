"use client";

import Link from "next/link";
import { useState } from "react";

export default function CookieBanner({ initiallyDismissed }: { initiallyDismissed: boolean }) {
  const [dismissed, setDismissed] = useState(initiallyDismissed);

  if (dismissed) return null;

  function accept() {
    document.cookie = "cookie-consent=accepted; path=/; max-age=31536000; samesite=lax";
    setDismissed(true);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
      <p>
        This site uses a couple of first-party cookies to remember your theme and which network site you&apos;re
        on &mdash; no ads, no tracking. See the <Link href="/privacy">Privacy Policy</Link> for details.
      </p>
      <button type="button" className="cookie-accept" onClick={accept}>
        Got it
      </button>
    </div>
  );
}
