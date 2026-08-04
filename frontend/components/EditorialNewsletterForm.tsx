"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EditorialNewsletterForm({ brandSlug }: { brandSlug: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe?brand=${brandSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="editorial-newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="you@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "submitting" || status === "done"}
      />
      <button type="submit" disabled={status === "submitting" || status === "done"}>
        {status === "done" ? "Subscribed" : status === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && <p className="newsletter-form-error">Something went wrong — try again.</p>}
    </form>
  );
}
