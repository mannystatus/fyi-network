"""
Run with: python -m app.seed
Populates the three fyi brands + a couple of sample articles each,
so the frontend has something real to render right away.
"""
from .database import Base, engine, SessionLocal
from .models import Brand, Article

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

SAMPLE_ARTICLES = {
    "fyimac": [
        dict(slug="apple-event-recap", category="Apple",
             title="Everything Apple announced today",
             dek="A rundown of the headline features.", author="fyi Staff",
             body_md="## Highlights\n\nThis is placeholder body copy — replace with real reporting."),
        dict(slug="m5-macbook-air-review", category="Mac",
             title="M5 MacBook Air review: small chip, big jump",
             dek="We benchmarked it against the last three generations.", author="fyi Staff",
             body_md="## Benchmarks\n\nPlaceholder body copy — replace with real reporting."),
        dict(slug="ios-27-hidden-setting", category="iOS",
             title="iOS 27's most useful hidden setting",
             dek="Buried three menus deep, worth the trip.", author="fyi Staff",
             body_md="## Where to find it\n\nPlaceholder body copy — replace with real reporting."),
    ],
    "fyiwin": [
        dict(slug="windows-update-notes", category="Windows 11",
             title="This week's Windows update, explained",
             dek="What actually changed under the hood.", author="fyi Staff",
             body_md="## What's new\n\nPlaceholder body copy — replace with real reporting."),
        dict(slug="best-mini-pcs-home-server", category="Hardware",
             title="The best mini PCs for a Windows home server",
             dek="Four options, tested for a month each.", author="fyi Staff",
             body_md="## The contenders\n\nPlaceholder body copy — replace with real reporting."),
        dict(slug="copilot-file-search", category="Copilot",
             title="Copilot's new file search is actually good now",
             dek="Here's what changed since launch.", author="fyi Staff",
             body_md="## What changed\n\nPlaceholder body copy — replace with real reporting."),
    ],
    "fyigoogle": [
        dict(slug="pixel-feature-drop", category="Pixel",
             title="Pixel's latest feature drop, tested",
             dek="We tried the new features so you don't have to.", author="fyi Staff",
             body_md="## First impressions\n\nPlaceholder body copy — replace with real reporting."),
        dict(slug="chrome-tab-groups-sync", category="Chrome",
             title="Chrome's new tab groups sync across devices",
             dek="A small change that fixes a years-old complaint.", author="fyi Staff",
             body_md="## How it works\n\nPlaceholder body copy — replace with real reporting."),
        dict(slug="android-17-battery-gains", category="Android",
             title="Android 17's battery gains, measured",
             dek="Real screen-on-time numbers, not marketing slides.", author="fyi Staff",
             body_md="## The numbers\n\nPlaceholder body copy — replace with real reporting."),
    ],
}

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

for slug, articles in SAMPLE_ARTICLES.items():
    for a in articles:
        exists = (
            db.query(Article)
            .filter(Article.brand_id == brand_rows[slug].id, Article.slug == a["slug"])
            .first()
        )
        if not exists:
            db.add(Article(brand_id=brand_rows[slug].id, **a))

db.commit()
print("Seeded brands:", list(brand_rows.keys()))
