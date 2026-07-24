"""
Run with: python -m app.seed
Populates the three fyi brands (and their topics). Article content isn't
seeded here — it comes from `python -m app.ingest_news`, which pulls real,
current news per topic. Run that right after this to populate the feed.
"""
from .database import Base, engine, SessionLocal
from .models import Brand

Base.metadata.create_all(bind=engine)
db = SessionLocal()

BRANDS = [
    dict(
        slug="fyimac", name="fyiMac", domain="fyimac.com",
        accent_color="#0071e3", icon="mac",  # Apple's own site blue — reads well in light and dark
        tagline="Apple news. Decoded daily.",
        topics="Mac,iPhone,iPad,Apple Watch,Apple TV+,Services",
    ),
    dict(
        slug="fyiwin", name="fyiWin", domain="fyiwin.com",
        accent_color="#0078d4", icon="win",  # Microsoft's Fluent/Windows 11 accent blue
        tagline="Windows news. Decoded daily.",
        topics="Windows 11,Hardware,Copilot",
    ),
    dict(
        slug="fyigoogle", name="fyiGoogle", domain="fyigoogle.com",
        accent_color="#4285f4", icon="google",  # Google's own brand blue
        tagline="Google news. Decoded daily.",
        topics="Pixel,Chrome,Android,YouTube",
    ),
    dict(
        slug="fyinetflix", name="fyiNetflix", domain="fyinetflix.com",
        accent_color="#e50914", icon="netflix",
        tagline="Netflix news. Decoded daily.",
        topics="New Releases,Netflix Originals,Renewals & Cancellations,Top 10,K-Drama",
    ),
    dict(
        slug="fyiflynow", name="fyiFlyNow", domain="fyiflynow.com",
        accent_color="#FF6B4A", icon="flynow",  # coral — the promo module's CTA/highlight color
        tagline="Flight deals. Decoded daily.",
        topics="Flight Deals,Airline News,Travel Tips",
    ),
]

brand_rows = {}
for b in BRANDS:
    existing = db.query(Brand).filter(Brand.slug == b["slug"]).first()
    if existing:
        # Brand is the single source of truth — keep every field current on
        # reseed of an existing DB, not just topics, so metadata changes
        # (like an accent color update) actually take effect on redeploy.
        for field, value in b.items():
            setattr(existing, field, value)
        brand_rows[b["slug"]] = existing
        continue
    row = Brand(**b)
    db.add(row)
    db.flush()
    brand_rows[b["slug"]] = row

db.commit()
print("Seeded brands:", list(brand_rows.keys()))
print("Now run: python -m app.ingest_news --all-brands   (to populate the feed)")
