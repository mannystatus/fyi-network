"use client";

export default function FlyNowFareAlertForm() {
  return (
    <form className="hero-form" onSubmit={(e) => e.preventDefault()}>
      <input type="email" placeholder="you@email.com" required />
      <button type="submit">Get Fare Alerts</button>
    </form>
  );
}
