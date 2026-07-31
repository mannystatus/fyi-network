"use client";

import { REOPEN_EVENT } from "./CookieBanner";

export default function CookieSettingsLink() {
  return (
    <button type="button" className="footer-link-button" onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}>
      Cookie Settings
    </button>
  );
}
