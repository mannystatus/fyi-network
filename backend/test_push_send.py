from app.database import SessionLocal
from app.models import PushSubscription
from pywebpush import webpush, WebPushException
import os, json

db = SessionLocal()
sub = db.query(PushSubscription).filter(PushSubscription.brand_slug == "fyidodgers").first()
if not sub:
    print("no subscription found")
else:
    claim_email = os.environ.get("VAPID_CLAIM_EMAIL") or "tech@fyi-network.com"
    try:
        webpush(
            subscription_info={"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
            data=json.dumps({
                "title": "fyiDodgers test push",
                "body": "If you see this, the full pipeline works end to end.",
                "url": "https://www.fyidodgers.com/",
                "icon": "https://www.fyidodgers.com/icons/fyidodgers-512.png",
            }),
            vapid_private_key=os.environ["VAPID_PRIVATE_KEY"],
            vapid_claims={"sub": "mailto:" + claim_email},
        )
        print("SENT OK")
    except WebPushException as e:
        print("SEND FAILED:", e)
