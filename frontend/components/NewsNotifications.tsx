"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const POLL_MS = 60_000;

/**
 * Opt-in browser notifications for new articles, styled after the bell-icon
 * popover on hackthedeal.com (pick categories, then Subscribe) rather than a
 * plain permission button. Deliberately lightweight: the Notification API
 * only, no Service Worker or Push subscription — this only fires while a
 * tab for this site is open.
 */
export default function NewsNotifications({
  brandSlug,
  brandName,
  topics,
}: {
  brandSlug: string;
  brandName: string;
  topics: string[];
}) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(topics));
  const knownSlugs = useRef<Set<string> | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const storageKey = `notify-topics-${brandSlug}`;

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSelected(new Set(JSON.parse(saved)));
      } catch {
        // ignore malformed storage, fall back to "all topics" default
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (permission !== "granted") return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/articles?limit=10`, {
          headers: { "X-Brand-Slug": brandSlug },
        });
        if (!res.ok || cancelled) return;
        const articles: { slug: string; title: string; dek: string | null; category: string | null }[] =
          await res.json();
        if (cancelled) return;

        if (knownSlugs.current === null) {
          // First poll after enabling — just record what's already on the
          // page. Don't fire notifications retroactively for old articles.
          knownSlugs.current = new Set(articles.map((a) => a.slug));
          return;
        }

        for (const a of articles) {
          if (knownSlugs.current.has(a.slug)) continue;
          knownSlugs.current.add(a.slug);
          if (a.category && !selected.has(a.category)) continue;
          new Notification(`${brandName}: ${a.title}`, {
            body: a.dek || "New article just published.",
            tag: a.slug,
          });
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
  }, [permission, brandSlug, brandName, selected]);

  if (!supported) return null;

  function toggleTopic(t: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }

  async function subscribe() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") setOpen(false);
  }

  return (
    <div className="notify-widget" ref={widgetRef}>
      <button
        type="button"
        className="notify-bell"
        aria-label={permission === "granted" ? "Manage notifications" : "Enable notifications"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {permission === "granted" ? "🔔" : "🔕"}
      </button>

      {open && (
        <div className="notify-popover" role="dialog" aria-label="Notification settings">
          <p className="notify-popover-title">Get notified on new articles</p>
          <p className="notify-popover-desc">
            We&apos;ll ping you when {brandName} publishes something new, in the topics you pick below.
          </p>
          <div className="notify-topic-list">
            {topics.map((t) => (
              <label key={t} className="notify-topic-row">
                <input type="checkbox" checked={selected.has(t)} onChange={() => toggleTopic(t)} />
                {t}
              </label>
            ))}
          </div>
          {permission === "granted" ? (
            <p className="notify-status">🔔 Notifications on</p>
          ) : permission === "denied" ? (
            <p className="notify-status">Blocked in your browser&apos;s site settings.</p>
          ) : (
            <button type="button" className="notify-subscribe" onClick={subscribe}>
              Subscribe
            </button>
          )}
        </div>
      )}
    </div>
  );
}
