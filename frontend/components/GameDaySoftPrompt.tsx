"use client";

// Mirrors hackthedeal.com's PushSoftPrompt — a soft, branded ask that shows
// before the real browser permission dialog, so declining doesn't burn the
// one native prompt Chrome allows per origin. Only "Allow" calls
// subscribeToPush(), which is what actually triggers Chrome's dialog.
// Only ever mounted for fyiDodgers/fyiLakers (see template.tsx) — every
// other brand still uses the lighter NewsNotifications bell popover.
import { useEffect, useState } from "react";
import { subscribeToPush, pushSoftDismissKey, PUSH_SOFT_DISMISS_COOLDOWN_MS } from "../lib/pushClient";

export default function GameDaySoftPrompt({ brandSlug, teamName }: { brandSlug: string; teamName: string }) {
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    if (typeof Notification === "undefined" || Notification.permission !== "default") return;

    const dismissedAt = Number(localStorage.getItem(pushSoftDismissKey(brandSlug)) || 0);
    if (dismissedAt && Date.now() - dismissedAt < PUSH_SOFT_DISMISS_COOLDOWN_MS) return;

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!supported || !visible) return null;

  function dismiss() {
    localStorage.setItem(pushSoftDismissKey(brandSlug), String(Date.now()));
    setEntered(false);
    setTimeout(() => setVisible(false), 200);
  }

  async function allow() {
    setBusy(true);
    setError(null);
    try {
      await subscribeToPush(brandSlug);
      dismiss();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Couldn't enable notifications.");
    }
  }

  return (
    <div
      style={{
        position: "fixed", right: 20, top: 20, width: 340, maxWidth: "calc(100vw - 40px)",
        background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)", padding: 18, zIndex: 9999,
        opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 220ms ease, transform 220ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}
        >
          🔔
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: "var(--comment)", textTransform: "uppercase" }}>
            {teamName}
          </p>
          <p style={{ margin: "4px 0 2px", fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>
            Never miss tip-off
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--comment)", lineHeight: 1.4 }}>
            Turn on browser notifications and we&apos;ll ping you an hour before each game, plus the final score.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          style={{ background: "none", border: "none", color: "var(--comment)", fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      {error ? <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--red)" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          disabled={busy}
          onClick={dismiss}
          style={{
            flex: 1, fontSize: 12.5, fontWeight: 700, padding: "9px 10px", borderRadius: 8,
            border: "1.5px solid var(--border)", background: "none", color: "var(--fg)",
            cursor: busy ? "default" : "pointer",
          }}
        >
          No Thanks
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={allow}
          style={{
            flex: 1, fontSize: 12.5, fontWeight: 700, padding: "9px 10px", borderRadius: 8,
            border: "none", background: "var(--accent)", color: "#000",
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Allowing…" : "Allow"}
        </button>
      </div>
    </div>
  );
}
