from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import resolve_brand
from ..models import Brand, NewsletterSubscriber
from ..schemas import NewsletterSubscribeIn

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


@router.post("/subscribe", status_code=204)
def newsletter_subscribe(
    body: NewsletterSubscribeIn,
    db: Session = Depends(get_db),
    brand: Brand = Depends(resolve_brand),
):
    existing = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.brand_slug == brand.slug, NewsletterSubscriber.email == body.email)
        .first()
    )
    if not existing:
        db.add(NewsletterSubscriber(brand_slug=brand.slug, email=body.email))
        db.commit()
