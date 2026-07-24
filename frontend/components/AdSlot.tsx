"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID } from "../lib/analytics";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Reserves a labeled ad section wherever it's rendered. With no slot ID
// configured for this placement (see lib/analytics.ts AD_SLOTS) it shows an
// empty placeholder so the layout position is visible before any AdSense
// unit exists; once a slot ID is set, it renders the real AdSense unit and
// requests a fill.
export default function AdSlot({ slot, label = "Advertisement" }: { slot?: string; label?: string }) {
  const requested = useRef(false);

  useEffect(() => {
    if (!slot || requested.current) return;
    requested.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle.js may not have loaded yet (blocked, slow network) —
      // nothing more useful to do than leave this slot unfilled.
    }
  }, [slot]);

  return (
    <div className="ad-slot" data-live={Boolean(slot)}>
      <span className="ad-slot-label">{label}</span>
      {slot ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot-placeholder">Ad space</div>
      )}
    </div>
  );
}
