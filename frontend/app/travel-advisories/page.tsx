import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCurrentBrand,
  getTravelAdvisories,
  getVisaPassports,
  getVisaRequirements,
  type TravelAdvisory,
  type VisaPassport,
} from "../../lib/api";
import { canonicalOrigin } from "../../lib/url";
import PassportSelect from "../../components/PassportSelect";
import TravelAdvisoryBanner from "../../components/TravelAdvisoryBanner";

// fyiFlyNow-only — every other brand 404s. Lives at its own URL (rather
// than only as the homepage's TravelAdvisoryBanner teaser) so the full
// list, sources, and per-country links are indexable and linkable on
// their own. Advisory data comes from TravelAdvisory (refreshed ~6h);
// visa/e-visa/ETA data comes from VisaRequirement (refreshed weekly) —
// see backend/app/ingest_travel_advisories.py and
// ingest_visa_requirements.py.

const DEFAULT_PASSPORT = "USA";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  if (brand.icon !== "flynow") return {};

  const title = "Travel Advisories: Where It's Dangerous to Travel Right Now";
  const description =
    "Countries currently flagged by the US State Department and UK Foreign, Commonwealth & Development Office as unsafe or high-risk for travel, plus visa and e-visa requirements.";
  const url = `${canonicalOrigin(brand.domain)}/travel-advisories`;

  return {
    title,
    description,
    alternates: { canonical: "/travel-advisories" },
    openGraph: { title, description, type: "website", url, siteName: brand.name },
    twitter: { card: "summary", title, description },
  };
}

type Merged = {
  country: string;
  severity: number;
  entries: TravelAdvisory[];
};

function mergeByCountry(advisories: TravelAdvisory[]): Merged[] {
  const byCountry = new Map<string, Merged>();
  for (const a of advisories) {
    const key = a.country.toLowerCase();
    const existing = byCountry.get(key);
    if (existing) {
      existing.severity = Math.max(existing.severity, a.severity);
      existing.entries.push(a);
    } else {
      byCountry.set(key, { country: a.country, severity: a.severity, entries: [a] });
    }
  }
  return [...byCountry.values()].sort((a, b) => b.severity - a.severity || a.country.localeCompare(b.country));
}

const SOURCE_NAME: Record<TravelAdvisory["source"], string> = {
  US: "US State Dept",
  UK: "UK FCDO",
};

type VisaTone = "free" | "caution" | "required";

function formatVisaRequirement(requirement: string): { label: string; tone: VisaTone } {
  if (/^\d+$/.test(requirement)) return { label: `Visa-free (${requirement} days)`, tone: "free" };
  switch (requirement) {
    case "visa free":
      return { label: "Visa-free", tone: "free" };
    case "visa on arrival":
      return { label: "Visa on arrival", tone: "caution" };
    case "e-visa":
      return { label: "e-Visa required", tone: "caution" };
    case "eta":
      return { label: "Electronic Travel Authorization (ETA) required", tone: "caution" };
    case "visa required":
      return { label: "Visa required", tone: "required" };
    case "no admission":
      return { label: "No admission", tone: "required" };
    default:
      return { label: requirement, tone: "caution" };
  }
}

function CountryCard({ m, visaByCountry }: { m: Merged; visaByCountry: Map<string, string> }) {
  const visa = visaByCountry.get(m.country);
  const formatted = visa ? formatVisaRequirement(visa) : null;

  return (
    <div className="country-card">
      <h3>{m.country}</h3>
      {m.entries.map((e) => (
        <div className="source-row" key={e.source}>
          <span>{SOURCE_NAME[e.source]}:</span>
          <a href={e.url} target="_blank" rel="noopener noreferrer">
            {e.level}
            {e.scope === "parts" ? " (parts of country)" : ""}
          </a>
        </div>
      ))}
      <div className={`visa-row visa-${formatted?.tone ?? "unknown"}`}>
        {formatted ? formatted.label : "No visa data available"}
      </div>
    </div>
  );
}

export default async function TravelAdvisoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ passport?: string }>;
}) {
  const brand = await getCurrentBrand();
  if (brand.icon !== "flynow") notFound();

  const { passport: passportParam } = await searchParams;
  const passport = (passportParam || DEFAULT_PASSPORT).toUpperCase();

  let advisories: TravelAdvisory[] = [];
  let loadFailed = false;
  try {
    advisories = await getTravelAdvisories();
  } catch {
    loadFailed = true;
  }

  let passports: VisaPassport[] = [];
  let visaByCountry = new Map<string, string>();
  try {
    const [passportList, visaRows] = await Promise.all([getVisaPassports(), getVisaRequirements(passport)]);
    passports = passportList;
    visaByCountry = new Map(visaRows.map((v) => [v.country, v.requirement]));
  } catch {
    // Visa data is a nice-to-have layered on top of advisories — if it's
    // unavailable, the page still works, just without visa badges.
  }

  const severe = mergeByCountry(advisories.filter((a) => a.severity >= 4));
  const elevated = mergeByCountry(advisories.filter((a) => a.severity === 3));

  return (
    <article className="travel-advisories-page">
      <style>{`
        /* Base rules like body/#site only set background, not color — every
           other page's text gets its color from a per-element rule
           referencing --fg/--comment (see .article-title/.article-dek in
           globals.css). Setting it once here, instead of on every custom
           class below, so nothing here falls back to the browser's default
           black text on this page's dark background. */
        .travel-advisories-page { color: var(--fg); }
        .travel-advisories-page .passport-select {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 13px;
          color: var(--comment);
          margin: 20px 0 4px;
        }
        .travel-advisories-page .passport-select select {
          font-size: 13px;
          font-family: inherit;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-alt);
          color: var(--fg);
        }
        .travel-advisories-page .country-group { margin-top: 28px; }
        .travel-advisories-page .country-group h2 { font-size: 18px; margin-bottom: 4px; }
        .travel-advisories-page .country-group p.group-desc { font-size: 13px; color: var(--comment); margin-bottom: 16px; }
        .travel-advisories-page .country-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 10px;
        }
        .travel-advisories-page .country-card h3 { font-size: 15px; margin: 0 0 8px; }
        .travel-advisories-page .source-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: baseline;
          font-size: 13px;
          color: var(--comment);
          margin-bottom: 4px;
        }
        .travel-advisories-page .source-row:last-of-type { margin-bottom: 10px; }
        .travel-advisories-page .source-row a { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
        .travel-advisories-page .visa-row {
          font-size: 13px;
          font-weight: 500;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .travel-advisories-page .visa-free { color: var(--green); }
        .travel-advisories-page .visa-caution { color: var(--yellow); }
        .travel-advisories-page .visa-required { color: var(--red); }
        .travel-advisories-page .visa-unknown { color: var(--comment); font-weight: 400; }
        .travel-advisories-page .empty-note, .travel-advisories-page .fail-note {
          font-size: 14px; color: var(--comment); margin-top: 20px;
        }
        .travel-advisories-page .disclaimer {
          font-size: 12.5px;
          color: var(--comment);
          line-height: 1.7;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .travel-advisories-page .disclaimer a { color: var(--fg); text-decoration: underline; }
      `}</style>

      <div className="article-header">
        <h1 className="article-title">Travel Advisories</h1>
        <p className="article-dek">
          Countries currently flagged by the US State Department or the UK Foreign, Commonwealth &amp; Development
          Office as unsafe or high-risk for travel right now, plus visa and e-visa requirements for getting in.
        </p>
      </div>

      <TravelAdvisoryBanner />

      {passports.length > 0 && <PassportSelect passports={passports} selected={passport} />}

      {loadFailed && (
        <p className="fail-note">Advisory data is temporarily unavailable — check back shortly.</p>
      )}

      {!loadFailed && advisories.length === 0 && (
        <p className="empty-note">No high-severity advisories are currently on file.</p>
      )}

      {severe.length > 0 && (
        <div className="country-group">
          <h2>Do Not Travel</h2>
          <p className="group-desc">
            US Level 4 (Do Not Travel) and/or UK &quot;advise against all travel&quot;.
          </p>
          {severe.map((m) => (
            <CountryCard m={m} visaByCountry={visaByCountry} key={m.country} />
          ))}
        </div>
      )}

      {elevated.length > 0 && (
        <div className="country-group">
          <h2>Reconsider Travel</h2>
          <p className="group-desc">
            US Level 3 (Reconsider Travel) and/or UK &quot;advise against all but essential travel&quot;.
          </p>
          {elevated.map((m) => (
            <CountryCard m={m} visaByCountry={visaByCountry} key={m.country} />
          ))}
        </div>
      )}

      <p className="disclaimer">
        Advisories sourced from the official{" "}
        <a href="https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html" target="_blank" rel="noopener noreferrer">
          US State Department travel advisories
        </a>{" "}
        and{" "}
        <a href="https://www.gov.uk/foreign-travel-advice" target="_blank" rel="noopener noreferrer">
          UK FCDO foreign travel advice
        </a>{" "}
        feeds, refreshed roughly every 6 hours. Visa/e-visa/ETA data comes from the open-source{" "}
        <a href="https://github.com/imorte/passport-index-data" target="_blank" rel="noopener noreferrer">
          passport-index-data
        </a>{" "}
        project, refreshed weekly — always confirm requirements with the destination country&apos;s embassy or an
        official government source before you book or fly. Only Level 3+ (US) / &quot;essential travel
        only&quot;-or-worse (UK) countries are listed here.
      </p>
    </article>
  );
}
