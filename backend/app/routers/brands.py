from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Brand
from ..schemas import BrandOut, BrandUpdate
from ..deps import resolve_brand
from ..auth import AdminScope, require_admin

router = APIRouter(prefix="/api/brands", tags=["brands"])


@router.get("", response_model=list[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    """All brands in the network — this is what powers the domain switcher UI."""
    return db.query(Brand).all()


@router.get("/current", response_model=BrandOut)
def current_brand(brand: Brand = Depends(resolve_brand)):
    """Resolves which brand the requesting domain/header maps to."""
    return brand


@router.patch("/{slug}", response_model=BrandOut)
def update_brand(slug: str, payload: BrandUpdate, db: Session = Depends(get_db), scope: AdminScope = Depends(require_admin)):
    """Admin-gated — currently just sets the site header banner from /admin."""
    scope.check_brand(slug.strip().lower())

    brand = db.query(Brand).filter(Brand.slug == slug.strip().lower()).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if payload.image_url is not None:
        brand.image_url = payload.image_url

    db.commit()
    db.refresh(brand)
    return brand
