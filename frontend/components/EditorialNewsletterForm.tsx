"use client";

import { useState } from "react";

// Local-state only — no real email capture on the backend yet, same as
// CamsNewsletterForm and the same gap the design mockups themselves note
// ("needs real email capture wired to a backend").
export default function EditorialNewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="editorial-newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input type="email" placeholder="you@email.com" required disabled={submitted} />
      <button type="submit" disabled={submitted}>
        {submitted ? "Subscribed" : "Subscribe"}
      </button>
    </form>
  );
}
