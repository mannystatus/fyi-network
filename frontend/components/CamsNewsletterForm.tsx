"use client";

import { useState } from "react";

// Local-state only for v1 — no real email capture on the backend yet (the
// design handoff calls this out as a known gap, not something to fake a
// convincing-looking success state for beyond swapping the button copy).
export default function CamsNewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="cams-newsletter-form"
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
