import { getTravelAdvisories, type TravelAdvisory } from "../lib/api";

const MAX_SHOWN = 8;

type Merged = {
  country: string;
  severity: number;
  badges: string[]; // e.g. ["US · Level 4: Do Not Travel", "UK · Advise against all travel"]
};

function mergeByCountry(advisories: TravelAdvisory[]): Merged[] {
  const byCountry = new Map<string, Merged>();
  for (const a of advisories) {
    const key = a.country.toLowerCase();
    const badge = `${a.source} · ${a.level}${a.scope === "parts" ? " (parts of country)" : ""}`;
    const existing = byCountry.get(key);
    if (existing) {
      existing.severity = Math.max(existing.severity, a.severity);
      existing.badges.push(badge);
    } else {
      byCountry.set(key, { country: a.country, severity: a.severity, badges: [badge] });
    }
  }
  return [...byCountry.values()].sort((a, b) => b.severity - a.severity || a.country.localeCompare(b.country));
}

// Server component so a slow/unavailable backend degrades to "no banner"
// rather than breaking the homepage render.
export default async function TravelAdvisoryBanner() {
  let advisories: TravelAdvisory[] = [];
  try {
    advisories = await getTravelAdvisories();
  } catch {
    return null;
  }
  if (advisories.length === 0) return null;

  const merged = mergeByCountry(advisories);
  const shown = merged.slice(0, MAX_SHOWN);
  const remaining = merged.length - shown.length;

  return (
    <section className="travel-advisory-banner">
      <style>{`
        /* Same --fg/--comment/--border/--red tokens the rest of the site
           uses (see globals.css) — a thin red border/heading is the only
           thing marking this as an alert, rather than a one-off color set
           that wouldn't track the site's light/dark toggle or per-brand
           accent. */
        .travel-advisory-banner {
          color: var(--fg);
          background: var(--bg-alt);
          border: 1px solid var(--red);
          border-radius: 10px;
          padding: 20px 22px;
          margin: 0 0 28px;
        }
        .travel-advisory-banner .tab-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .travel-advisory-banner .tab-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--red);
          flex: none;
        }
        .travel-advisory-banner h2 {
          font-size: 14px;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: var(--red);
          margin: 0;
        }
        .travel-advisory-banner p.tab-desc {
          font-size: 13px;
          color: var(--comment);
          line-height: 1.6;
          margin: 0 0 16px;
          max-width: 640px;
        }
        .travel-advisory-banner .tab-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }
        .travel-advisory-banner .tab-chip {
          font-size: 12.5px;
          color: var(--fg);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 10px;
        }
        .travel-advisory-banner .tab-chip b { font-weight: 600; }
      `}</style>

      <div className="tab-head">
        <span className="tab-dot" />
        <h2>Travel Advisory</h2>
      </div>
      <p className="tab-desc">
        Countries currently flagged by the US State Department (Level 3–4) or the UK Foreign, Commonwealth &amp;
        Development Office as unsafe or high-risk for travel right now — full detail, sources, and visa requirements
        below.
      </p>
      <div className="tab-list">
        {shown.map((m) => (
          <span className="tab-chip" key={m.country} title={m.badges.join(" · ")}>
            <b>{m.country}</b>
          </span>
        ))}
        {remaining > 0 && <span className="tab-chip">+{remaining} more</span>}
      </div>
    </section>
  );
}
