from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Brand
from ..schemas import BrandOut
from ..deps import resolve_brand

router = APIRouter(prefix="/api/brands", tags=["brands"])


@router.get("", response_model=list[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    """All brands in the network — this is what powers the domain switcher UI."""
    return db.query(Brand).all()


@router.get("/current", response_model=BrandOut)
def current_brand(brand: Brand = Depends(resolve_brand)):
    """Resolves which brand the requesting domain/header maps to."""
    return brand
