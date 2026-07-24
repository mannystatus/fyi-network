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
        accent_color="#e8e8ed", icon="mac",
        tagline="Apple news. Decoded daily.",
        topics="Mac,iPhone,iPad,Apple Watch,Services",
    ),
    dict(
        slug="fyiwin", name="fyiWin", domain="fyiwin.com",
        accent_color="#7aa2f7", icon="win",
        tagline="Windows news. Decoded daily.",
        topics="Windows 11,Hardware,Copilot",
    ),
    dict(
        slug="fyigoogle", name="fyiGoogle", domain="fyigoogle.com",
        accent_color="#7aa2f7", icon="google",
        tagline="Google news. Decoded daily.",
        topics="Pixel,Chrome,Android",
    ),
]

brand_rows = {}
for b in BRANDS:
    existing = db.query(Brand).filter(Brand.slug == b["slug"]).first()
    if existing:
        existing.topics = b["topics"]  # keep topics current on reseed of an existing DB
        brand_rows[b["slug"]] = existing
        continue
    row = Brand(**b)
    db.add(row)
    db.flush()
    brand_rows[b["slug"]] = row

db.commit()
print("Seeded brands:", list(brand_rows.keys()))
print("Now run: python -m app.ingest_news --all-brands   (to populate the feed)")
