from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import TravelAdvisory
from ..schemas import TravelAdvisoryOut

router = APIRouter(prefix="/api/travel-advisories", tags=["travel-advisories"])


@router.get("", response_model=list[TravelAdvisoryOut])
def list_travel_advisories(db: Session = Depends(get_db)):
    """
    Global, not brand-scoped — only fyiFlyNow's frontend reads this today,
    but nothing here is per-brand data. Populated by
    app/ingest_travel_advisories.py, not through this API.
    """
    return (
        db.query(TravelAdvisory)
        .order_by(TravelAdvisory.severity.desc(), TravelAdvisory.source, TravelAdvisory.country)
        .all()
    )
