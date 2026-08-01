import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import resolve_brand
from ..models import Brand, PushSubscription
from ..schemas import PublicKeyOut, PushSubscribeIn, PushUnsubscribeIn

router = APIRouter(prefix="/api/push", tags=["push"])

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")


@router.get("/public-key", response_model=PublicKeyOut)
def push_public_key():
    if not VAPID_PUBLIC_KEY:
        raise HTTPException(status_code=503, detail="Push notifications are not configured")
    return PublicKeyOut(publicKey=VAPID_PUBLIC_KEY)


@router.post("/subscribe", status_code=204)
def push_subscribe(body: PushSubscribeIn, db: Session = Depends(get_db), brand: Brand = Depends(resolve_brand)):
    p256dh = body.keys.get("p256dh")
    auth = body.keys.get("auth")
    if not p256dh or not auth:
        raise HTTPException(status_code=422, detail="Missing subscription keys")

    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == body.endpoint).first()
    if existing:
        existing.brand_slug = brand.slug
        existing.p256dh = p256dh
        existing.auth = auth
    else:
        db.add(
            PushSubscription(
                brand_slug=brand.slug,
                endpoint=body.endpoint,
                p256dh=p256dh,
                auth=auth,
            )
        )
    db.commit()


@router.post("/unsubscribe", status_code=204)
def push_unsubscribe(body: PushUnsubscribeIn, db: Session = Depends(get_db)):
    db.query(PushSubscription).filter(PushSubscription.endpoint == body.endpoint).delete()
    db.commit()
