"use client";

import { useCallback, useEffect, useState } from "react";

// No real accounts on this site (see CamsNewsletterForm's plain email-capture
// POST) — "subscribed" is a client-only flag in this browser, not a server
// session. Every gated score reads/writes the same key so subscribing once
// anywhere on fyiCams unlocks every score on the site, including other
// gates already mounted on the same page (the custom event covers that —
// the native `storage` event only fires in *other* tabs, never the tab that
// made the change).
const STORAGE_KEY = "fyicams-subscribed";
const EVENT_NAME = "fyicams-subscribed-change";

function readSubscribed(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
}

export function useCamsSubscription() {
  // Starts false (matching SSR) even when already subscribed, then syncs in
  // an effect — avoids a hydration mismatch from reading localStorage during
  // the initial render.
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(readSubscribed());
    function onChange() {
      setSubscribed(readSubscribed());
    }
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const markSubscribed = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { subscribed, markSubscribed };
}
