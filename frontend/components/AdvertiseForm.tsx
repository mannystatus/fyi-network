"use client";

import { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqergnwr";

export default function AdvertiseForm({ brandName }: { brandName: string }) {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Formspree ignores submissions where this is filled
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !email.trim() || !message.trim()) return;
    setStatus("submitting");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Advertising inquiry — ${company}`,
          company,
          name,
          email,
          website: website.trim() || null,
          message,
          referrer_brand: brandName,
          _gotcha: honeypot || undefined,
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setCompany("");
        setName("");
        setEmail("");
        setWebsite("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="advertise-sent">Thanks — we'll be in touch shortly.</p>;
  }

  return (
    <form className="advertise-form" onSubmit={handleSubmit}>
      {/* Honeypot: visually hidden from real visitors, but a plain DOM field bots tend to fill in indiscriminately. */}
      <input
        type="text"
        name="company_website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <label className="advertise-field">
        Company / Brand name
        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
      </label>

      <label className="advertise-field">
        Your name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className="advertise-field">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label className="advertise-field">
        Website (optional)
        <input type="url" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>

      <label className="advertise-field">
        Tell us about what you'd like to promote
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>

      <button type="submit" className="advertise-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
      {status === "error" && <p className="advertise-error">Something went wrong — try again.</p>}
    </form>
  );
}
