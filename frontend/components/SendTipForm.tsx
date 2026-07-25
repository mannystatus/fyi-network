"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Challenge = { a: number; b: number; sig: string };

export default function SendTipForm({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [honeypot, setHoneypot] = useState(""); // real visitors never see or fill this
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
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

  function handleOpen() {
    setOpen((o) => {
      const next = !o;
      if (next && !challenge) {
        setOpenedAt(Date.now());
        fetch(`${API_URL}/api/tip/challenge`)
          .then((r) => r.json())
          .then(setChallenge)
          .catch(() => setChallenge(null));
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !challenge) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          a: challenge.a,
          b: challenge.b,
          sig: challenge.sig,
          answer: Number(answer),
          message,
          email: email.trim() || null,
          honeypot: honeypot || null,
          elapsed_ms: openedAt ? Date.now() - openedAt : 0,
          source: brandName,
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setEmail("");
        setAnswer("");
      } else {
        const detail = await res.json().catch(() => null);
        setErrorMsg(detail?.detail || "Something went wrong — try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Couldn't reach the server — try again.");
      setStatus("error");
    }
  }

  return (
    <div className="tip-widget" ref={widgetRef}>
      <button type="button" className="tip-trigger" aria-expanded={open} aria-label="Send us a tip" onClick={handleOpen}>
        Send us a tip
      </button>

      {open && (
        <div className="tip-popover" role="dialog" aria-label="Send us a tip">
          {status === "sent" ? (
            <p className="tip-sent">Thanks — got it.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="tip-popover-title">Got a tip for {brandName}?</p>

              {/* Honeypot: visually hidden from real visitors, but a plain
                  DOM field bots tend to fill in indiscriminately. */}
              <input
                type="text"
                name="company"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

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

              {challenge && (
                <label className="tip-check-label">
                  Quick check: what&apos;s {challenge.a} + {challenge.b}?
                  <input
                    type="number"
                    className="tip-check-input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                </label>
              )}

              <button
                type="submit"
                className="tip-submit"
                disabled={status === "submitting" || !message.trim() || !challenge}
              >
                {status === "submitting" ? "Sending…" : "Send tip"}
              </button>
              {status === "error" && <p className="tip-error">{errorMsg}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
