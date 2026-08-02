"use client";

import { useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function currentUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
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

  // Neither Instagram nor TikTok has a web share-intent URL like
  // Twitter/Facebook/LinkedIn do — there's no way to hand them a link
  // directly. Best available option: copy the link and drop the user into
  // the app/site so they can paste it into a Story, bio, or caption.
  async function shareToApp(appUrl: string, appName: string) {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setToast(`Link copied — paste it into ${appName}`);
      setTimeout(() => setToast(null), 2800);
    } catch {
      // Clipboard denied/unavailable — still open the app below.
    }
    window.open(appUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Share</span>
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
      <button
        type="button"
        aria-label="Copy link to share on Instagram"
        title="Copy link to share on Instagram"
        onClick={() => shareToApp("https://www.instagram.com/", "Instagram")}
      >
        <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Copy link to share on TikTok"
        title="Copy link to share on TikTok"
        onClick={() => shareToApp("https://www.tiktok.com/upload", "TikTok")}
      >
        <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
        </svg>
      </button>
      <button type="button" className="share-copy" aria-label="Copy link" onClick={copyLink}>
        {copied ? "Copied!" : "Copy link"}
      </button>
      {toast && <span className="share-toast">{toast}</span>}
    </div>
  );
}
