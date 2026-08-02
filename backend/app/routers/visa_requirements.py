from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import TravelAdvisory, VisaRequirement
from ..schemas import VisaPassportOut, VisaRequirementOut

router = APIRouter(prefix="/api/visa-requirements", tags=["visa-requirements"])

# TravelAdvisory.country comes from the US/UK advisory feeds (already
# canonicalized across the two sources — see
# ingest_travel_advisories.py's COUNTRY_NAME_CANONICAL); VisaRequirement's
# destination_name comes from the separate passport-index-data dataset.
# The two vocabularies mostly agree, but not always — found by diffing the
# two lists directly (see ingest_visa_requirements.py for the dataset).
# Keys are TravelAdvisory's spelling, values are the dataset's.
COUNTRY_ALIASES = {
    "Côte d'Ivoire": "Ivory Coast",
    "Democratic Republic of the Congo": "DR Congo",
    "Macau": "Macao",
}


@router.get("/passports", response_model=list[VisaPassportOut])
def list_passports(db: Session = Depends(get_db)):
    """Every passport in the dataset, for the picker dropdown."""
    rows = (
        db.query(VisaRequirement.passport_code, VisaRequirement.passport_name)
        .distinct()
        .order_by(VisaRequirement.passport_name)
        .all()
    )
    return [VisaPassportOut(code=code, name=name) for code, name in rows]


@router.get("", response_model=list[VisaRequirementOut])
def get_visa_requirements(
    passport: str = Query(..., description="ISO3 passport code, e.g. USA"),
    db: Session = Depends(get_db),
):
    """
    Visa/e-visa/ETA requirement for the given passport, scoped to whatever
    countries are currently in TravelAdvisory — not the full ~199-country
    matrix. A flagged country missing from the dataset (e.g. Western
    Sahara, which the dataset doesn't track) is simply omitted; the
    frontend treats an absent country as "no visa data available".
    """
    countries = [c for (c,) in db.query(TravelAdvisory.country).distinct().all()]
    if not countries:
        return []

    lookup_names = {COUNTRY_ALIASES.get(c, c): c for c in countries}
    rows = (
        db.query(VisaRequirement.destination_name, VisaRequirement.requirement)
        .filter(
            VisaRequirement.passport_code == passport.strip().upper(),
            VisaRequirement.destination_name.in_(lookup_names.keys()),
        )
        .all()
    )
    return [
        VisaRequirementOut(country=lookup_names[dest_name], requirement=requirement)
        for dest_name, requirement in rows
    ]
