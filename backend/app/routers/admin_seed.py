from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Brand
from ..auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

# TEMPORARY — backfills the fyiLakers Brand row into production. Needed
# because DATABASE_URL is a Vercel "sensitive" env var (write-only, nobody
# can read it back, including the account owner), so `python -m app.seed`
# can't be run against prod directly from outside Vercel's own runtime.
# Delete this file and its registration in main.py once fyilakers.com
# resolves correctly in production — this route should not stick around.
_LAKERS = dict(
    slug="fyilakers", name="fyiLakers", domain="fyilakers.com",
    accent_color="#4b1f73", icon="lakers",
    tagline="Lakers news. Decoded daily.",
    topics="Team News,Trade Rumors,Injury Report,Game Recaps,Draft & Free Agency",
)


@router.post("/seed-lakers", dependencies=[Depends(require_admin)])
def seed_lakers(db: Session = Depends(get_db)):
    existing = db.query(Brand).filter(Brand.slug == _LAKERS["slug"]).first()
    if existing:
        for field, value in _LAKERS.items():
            setattr(existing, field, value)
        db.commit()
        return {"status": "updated", "slug": existing.slug}
    db.add(Brand(**_LAKERS))
    db.commit()
    return {"status": "created", "slug": _LAKERS["slug"]}
