"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const POLL_MS = 60_000;

/**
 * Opt-in browser notifications for new articles on the current brand's feed.
 * Deliberately lightweight: the Notification API only, no Service Worker or
 * Push subscription, so this only fires while a tab for this site is open —
 * trading "works when the browser is closed" for zero new backend infra.
 */
export default function NewsNotifications({ brandSlug, brandName }: { brandSlug: string; brandName: string }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const knownSlugs = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/articles?limit=10`, {
          headers: { "X-Brand-Slug": brandSlug },
        });
        if (!res.ok || cancelled) return;
        const articles: { slug: string; title: string; dek: string | null }[] = await res.json();
        if (cancelled) return;

        if (knownSlugs.current === null) {
          // First poll after enabling — just record what's already on the
          // page. Don't fire notifications retroactively for old articles.
          knownSlugs.current = new Set(articles.map((a) => a.slug));
          return;
        }

        for (const a of articles) {
          if (!knownSlugs.current.has(a.slug)) {
            knownSlugs.current.add(a.slug);
            new Notification(`${brandName}: ${a.title}`, {
              body: a.dek || "New article just published.",
              tag: a.slug,
            });
          }
        }
      } catch {
        // Network hiccup — just try again on the next interval.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [permission, brandSlug, brandName]);

  if (permission === "unsupported" || permission === "denied") return null;

  if (permission === "granted") {
    return (
      <span className="notify-badge" title={`You'll be notified here of new ${brandName} articles`}>
        🔔 Notifications on
      </span>
    );
  }

  return (
    <button
      type="button"
      className="notify-btn"
      onClick={async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
      }}
    >
      🔔 Notify me of news
    </button>
  );
}
