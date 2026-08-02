"""
Run with: python -m app.ingest_travel_advisories

Populates TravelAdvisory with the high-severity "don't go here" entries
fyiFlyNow surfaces: US State Dept Level 3 (Reconsider Travel) / Level 4
(Do Not Travel) advisories, and UK FCDO "advise against all but essential
travel" / "advise against all travel" guidance. Meant to run on a schedule
(see .github/workflows/travel-advisories.yml) since neither government
updates these more than a few times a day.

US source: cadataapi.state.gov's unofficial-but-public JSON mirror of the
travel advisory feed (travel.state.gov itself sits behind a Cloudflare
bot-check that blocks plain server-side fetches). This API is flaky in
practice — during development it returned an empty array or a 429 on
roughly 3 of every 5 requests — so _fetch_us retries with backoff and
only reports success once it gets a real, non-empty list back.

UK source: gov.uk's Content API. There's no single "give me all advisories"
endpoint; /api/content/foreign-travel-advice lists every country page, and
each country's own page carries an `alert_status` field (e.g.
"avoid_all_travel_to_whole_country"). That means one index fetch plus one
fetch per country (~225) — sequential, since this only runs a few times a
day and gov.uk has shown no rate-limiting in testing, unlike the US feed.
"""
import datetime as dt
import re
import sys
import time

import httpx

from .database import Base, SessionLocal, engine, ensure_schema
from .models import TravelAdvisory

UA = "Mozilla/5.0 (compatible; fyi-network-travel-advisories/1.0)"
US_API_URL = "https://cadataapi.state.gov/api/TravelAdvisories"
UK_INDEX_URL = "https://www.gov.uk/api/content/foreign-travel-advice"
UK_BASE_URL = "https://www.gov.uk"

US_LEVEL_RE = re.compile(r"^(.*?)\s*-\s*Level (\d):\s*(.*)$")

# The US and UK feeds occasionally name the same country differently —
# found by diffing the two sources' country lists directly (US calls it
# "Burma", UK calls it "Myanmar (Burma)") — which would otherwise render
# as two separate, inconsistent cards for one real country on the
# frontend's per-country merge. Canonicalized here, at ingest, so there's
# one source of truth rather than every downstream merge needing to know
# about it. Values match the passport-index-data dataset's own naming
# (see ingest_visa_requirements.py) so visa lookups join cleanly too.
COUNTRY_NAME_CANONICAL = {
    "Burma": "Myanmar",
    "Myanmar (Burma)": "Myanmar",
}


def _canonical_country(name: str) -> str:
    return COUNTRY_NAME_CANONICAL.get(name, name)

# UK's alert_status values that count as "high severity" for this feature —
# see the clarifying-question answer this shipped against: Level 3/4
# equivalents only, not the lighter "increased caution" tier.
UK_AVOID_ALL = "avoid_all_travel"
UK_AVOID_ESSENTIAL = "avoid_all_but_essential_travel"


def _fetch_us(attempts: int = 6) -> list[dict] | None:
    """Returns parsed Level 3/4 rows, or None if every retry came back empty/failed."""
    for attempt in range(attempts):
        try:
            resp = httpx.get(US_API_URL, headers={"User-Agent": UA}, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and data:
                    break
        except httpx.HTTPError:
            pass
        time.sleep(2 * (attempt + 1))
    else:
        return None

    rows = []
    for item in data:
        m = US_LEVEL_RE.match(item.get("Title", ""))
        if not m:
            continue
        country, level_num, label = _canonical_country(m.group(1).strip()), int(m.group(2)), m.group(3).strip()
        if level_num not in (3, 4):
            continue
        updated = None
        if item.get("Updated"):
            try:
                updated = dt.datetime.fromisoformat(item["Updated"])
            except ValueError:
                pass
        rows.append(
            {
                "source": "US",
                "country": country,
                "level": f"Level {level_num}: {label}",
                "severity": level_num,
                "scope": "whole_country",
                "url": item.get("Link", "").strip(),
                "advisory_updated_at": updated,
            }
        )
    return _dedupe_by_country(rows)


# The feed occasionally lists a country twice under the same level — seen
# in practice for Haiti, once under its canonical traveladvisories/ URL and
# once under a legacy tsg_aem/ path with identical content — which would
# otherwise trip TravelAdvisory's (source, country) unique constraint on
# insert. Keeps the canonical-looking URL when there's a choice.
def _dedupe_by_country(rows: list[dict]) -> list[dict]:
    by_country: dict[str, dict] = {}
    for row in rows:
        existing = by_country.get(row["country"])
        if existing is None or ("tsg_aem" in existing["url"] and "tsg_aem" not in row["url"]):
            by_country[row["country"]] = row
    return list(by_country.values())


def _fetch_uk() -> list[dict] | None:
    try:
        resp = httpx.get(UK_INDEX_URL, headers={"User-Agent": UA}, timeout=20)
        resp.raise_for_status()
        children = resp.json().get("links", {}).get("children", [])
    except (httpx.HTTPError, ValueError):
        return None

    if not children:
        return None

    rows = []
    for child in children:
        base_path = child.get("base_path")
        api_path = child.get("api_path")
        country_name = (child.get("details") or {}).get("country", {}).get("name") or child.get("title", "")
        if not api_path or not country_name:
            continue
        country_name = _canonical_country(country_name)

        try:
            resp = httpx.get(f"{UK_BASE_URL}{api_path}", headers={"User-Agent": UA}, timeout=15)
            resp.raise_for_status()
            detail = resp.json()
        except (httpx.HTTPError, ValueError):
            continue

        statuses = (detail.get("details") or {}).get("alert_status") or []
        if any(s.startswith(UK_AVOID_ALL) for s in statuses):
            severity, label = 4, "Advise against all travel"
        elif any(s.startswith(UK_AVOID_ESSENTIAL) for s in statuses):
            severity, label = 3, "Advise against all but essential travel"
        else:
            continue

        scope = "whole_country" if any(s.endswith("_to_whole_country") for s in statuses) else "parts"
        updated = None
        if detail.get("public_updated_at"):
            try:
                updated = dt.datetime.fromisoformat(detail["public_updated_at"].replace("Z", "+00:00"))
            except ValueError:
                pass

        rows.append(
            {
                "source": "UK",
                "country": country_name,
                "level": label,
                "severity": severity,
                "scope": scope,
                "url": f"{UK_BASE_URL}{base_path}",
                "advisory_updated_at": updated,
            }
        )
    return _dedupe_by_country(rows)


def _replace_source(db, source: str, rows: list[dict]) -> None:
    db.query(TravelAdvisory).filter(TravelAdvisory.source == source).delete()
    now = dt.datetime.utcnow()
    for row in rows:
        db.add(TravelAdvisory(fetched_at=now, **row))
    db.commit()


def main() -> int:
    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        us_rows = _fetch_us()
        if us_rows is None:
            print("US fetch failed/empty after retries — leaving existing US rows untouched.", file=sys.stderr)
        else:
            _replace_source(db, "US", us_rows)
            print(f"US: {len(us_rows)} advisories")

        uk_rows = _fetch_uk()
        if uk_rows is None:
            print("UK fetch failed/empty — leaving existing UK rows untouched.", file=sys.stderr)
        else:
            _replace_source(db, "UK", uk_rows)
            print(f"UK: {len(uk_rows)} advisories")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
