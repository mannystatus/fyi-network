"use client";

import { useEffect, useRef, useState } from "react";

// Shared across all five brands — the `source` field on each submission
// says which site it came from, since one Formspree form serves everyone.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqergnwr";

export default function SendTipForm({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("submitting");

    const body = new FormData();
    body.set("message", message);
    if (email.trim()) body.set("email", email);
    body.set("_subject", `Tip for ${brandName}`);
    body.set("source", brandName);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="tip-widget" ref={widgetRef}>
      <button
        type="button"
        className="tip-trigger"
        aria-expanded={open}
        aria-label="Send us a tip"
        onClick={() => setOpen((o) => !o)}
      >
        Send us a tip
      </button>

      {open && (
        <div className="tip-popover" role="dialog" aria-label="Send us a tip">
          {status === "sent" ? (
            <p className="tip-sent">Thanks — got it.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="tip-popover-title">Got a tip for {brandName}?</p>
              <textarea
                className="tip-message"
                placeholder="What's the story?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
              <input
                type="email"
                className="tip-email"
                placeholder="Your email (optional, so we can follow up)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="tip-submit" disabled={status === "submitting" || !message.trim()}>
                {status === "submitting" ? "Sending…" : "Send tip"}
              </button>
              {status === "error" && <p className="tip-error">Something went wrong — try again.</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
