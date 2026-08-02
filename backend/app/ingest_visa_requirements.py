"""
Run with: python -m app.ingest_visa_requirements

Populates VisaRequirement with the full passport -> destination visa
requirement matrix, sourced from imorte/passport-index-data (MIT-licensed,
actively maintained continuation of ilyankou/passport-index-dataset —
~199 passports x ~199 destinations, updated every few weeks). Unlike
travel advisories, this data changes rarely, so this is meant to run on a
much slower schedule (see .github/workflows/visa-requirements.yml —
weekly) rather than every few hours.

Fetches two aligned files rather than one: the ISO3-coded tidy CSV (the
actual passport/destination/requirement rows — codes, not names, are the
stable join key) and the full-name matrix CSV, whose header row is
confirmed (by construction, both are generated from the same underlying
matrix) to line up 1:1 with the ISO3 matrix's header — that's how display
names get attached to each code without a separate lookup table existing
in the repo.
"""
import csv
import datetime as dt
import io
import sys

import httpx

from .database import Base, SessionLocal, engine, ensure_schema
from .models import VisaRequirement

UA = "Mozilla/5.0 (compatible; fyi-network-visa-requirements/1.0)"
BASE_URL = "https://raw.githubusercontent.com/imorte/passport-index-data/main"
TIDY_ISO3_URL = f"{BASE_URL}/passport-index-tidy-iso3.csv"
MATRIX_NAME_URL = f"{BASE_URL}/passport-index-matrix.csv"
MATRIX_ISO3_URL = f"{BASE_URL}/passport-index-matrix-iso3.csv"


def _fetch_csv(url: str) -> list[list[str]]:
    resp = httpx.get(url, headers={"User-Agent": UA}, timeout=30)
    resp.raise_for_status()
    return list(csv.reader(io.StringIO(resp.text)))


def _fetch() -> list[dict] | None:
    try:
        tidy_rows = _fetch_csv(TIDY_ISO3_URL)
        name_header = _fetch_csv(MATRIX_NAME_URL)[0]
        iso3_header = _fetch_csv(MATRIX_ISO3_URL)[0]
    except httpx.HTTPError:
        return None

    if len(name_header) != len(iso3_header) or len(name_header) < 2:
        return None
    code_to_name = dict(zip(iso3_header[1:], name_header[1:]))

    rows = []
    for row in tidy_rows[1:]:  # skip header: Passport,Destination,Requirement
        if len(row) != 3:
            continue
        passport_code, destination_code, requirement = row
        if requirement == "-1" or passport_code == destination_code:
            continue  # passport == destination placeholder, not a real requirement
        passport_name = code_to_name.get(passport_code)
        destination_name = code_to_name.get(destination_code)
        if not passport_name or not destination_name:
            continue
        rows.append(
            {
                "passport_code": passport_code,
                "passport_name": passport_name,
                "destination_code": destination_code,
                "destination_name": destination_name,
                "requirement": requirement,
            }
        )
    return rows if rows else None


def main() -> int:
    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        rows = _fetch()
        if rows is None:
            print("Fetch failed/empty — leaving existing visa requirement rows untouched.", file=sys.stderr)
            return 0

        db.query(VisaRequirement).delete()
        now = dt.datetime.utcnow()
        for row in rows:
            db.add(VisaRequirement(fetched_at=now, **row))
        db.commit()
        print(f"{len(rows)} visa requirement rows")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
