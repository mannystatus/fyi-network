"use client";

import { useState } from "react";
import { useCamsSubscription } from "../lib/useCamsSubscription";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Wraps a review score everywhere it appears (homepage mosaic/score list,
// review detail badge, article sidebar spec row) — shows a lock icon until
// this browser has subscribed (see useCamsSubscription), which expands
// inline into the same email-capture POST CamsNewsletterForm uses. Several
// call sites nest this inside a <Link> (score rows/mosaic cards double as
// links to the review), hence preventDefault/stopPropagation throughout —
// clicking the lock or typing in the form must never trigger that Link's
// navigation.
export default function CamsScoreGate({
  brandSlug,
  children,
}: {
  brandSlug: string;
  children: React.ReactNode;
}) {
  const { subscribed, markSubscribed } = useCamsSubscription();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  if (subscribed) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStatus("submitting");
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe?brand=${brandSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) markSubscribed();
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <span className="cams-score-gate">
      {open ? (
        <form
          className="cams-score-gate-form"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
          />
          <button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "…" : "Unlock"}
          </button>
          {status === "error" && <span className="cams-score-gate-error">Try again</span>}
        </form>
      ) : (
        <button
          type="button"
          className="cams-score-gate-lock"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label="Subscribe to see our score"
          title="Subscribe to see our score"
        >
          🔒
        </button>
      )}
    </span>
  );
}
