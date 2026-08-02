"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Neither Instagram nor TikTok has a web share-intent URL like
    // Twitter/Facebook/LinkedIn do, so the only real way to get an article
    // into either app is the OS share sheet (mobile only — no desktop
    // browser exposes Instagram/TikTok as a share target).
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  function currentUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: currentUrl() });
    } catch {
      // AbortError when the user dismisses the share sheet — nothing to do.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be denied/unavailable (older Safari, insecure
      // context) — nothing more useful to do without a text-selection
      // fallback UI, so the button just silently no-ops.
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Share</span>
      {canNativeShare && (
        <button
          type="button"
          aria-label="Share to Instagram, TikTok & more"
          title="Share to Instagram, TikTok & more"
          onClick={nativeShare}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
        </button>
      )}
      <button
        type="button"
        aria-label="Share on X"
        title="Share on X"
        onClick={() =>
          openShareWindow(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl())}`
          )
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.2l-5.6-7.3L4 22H1l8.1-9.3L.9 2h7.4l5.1 6.7L18.9 2Zm-1.3 18h2L6.5 4H4.3l13.3 16Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        onClick={() =>
          openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`)
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-.95.26-1.6 1.63-1.6H17V3.5A22 22 0 0 0 14.6 3c-2.4 0-4 1.46-4 4.14v2.16H8v3.3h2.6V22h2.9Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        onClick={() =>
          openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`)
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.6 4.78 6V21h-4v-5.4c0-1.3-.02-3-1.85-3-1.85 0-2.13 1.4-2.13 2.9V21h-4V9Z" />
        </svg>
      </button>
      <button type="button" className="share-copy" aria-label="Copy link" onClick={copyLink}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
