// No fare-alert backend exists yet — inputs are disabled rather than
// accepting a submission that would silently go nowhere.
export default function FlyNowFareAlertForm() {
  return (
    <form className="hero-form">
      <input type="email" placeholder="you@email.com" disabled />
      <button type="button" disabled>
        Coming Soon
      </button>
    </form>
  );
}
