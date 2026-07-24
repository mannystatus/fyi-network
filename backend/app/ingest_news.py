"""
Run with: python -m app.ingest_news --brand fyimac
      or: python -m app.ingest_news --all-brands

Automatically finds real, current news for each of a brand's topics (the
same comma-separated list stored on Brand.topics — Mac, iPhone, iPad, Apple
Watch, Services, ...) via Google News RSS, no API key needed, and writes
short "brief" articles straight into the same database the site reads
from. Re-running is safe: articles are deduped by slug per brand, so
already-seen headlines are skipped and only genuinely new ones get added —
this is what keeps each brand's feed live without hand-authoring content.
"""
import argparse
import datetime as dt
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

from .database import Base, SessionLocal, engine
from .models import Article, Brand

RSS_URL = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
USER_AGENT = "Mozilla/5.0 (compatible; fyi-network-ingest/1.0)"

# Search-query overrides for topics whose plain name would be too ambiguous
# on its own (e.g. "Hardware" alone pulls in unrelated results). Falls back
# to the topic name verbatim if it isn't listed here, so adding a topic to
# a brand's `topics` column is enough to start ingesting it.
QUERY_OVERRIDES = {
    "Mac": "Apple Mac OR MacBook",
    "iPhone": "Apple iPhone",
    "iPad": "Apple iPad",
    "Apple Watch": "Apple Watch",
    "Services": "Apple Services App Store iCloud",
    "Windows 11": "Windows 11",
    "Hardware": "Windows PC laptop hardware",
    "Copilot": "Microsoft Copilot AI",
    "Pixel": "Google Pixel",
    "Chrome": "Google Chrome browser",
    "Android": "Android OS",
}


def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:80].rstrip("-")


def fetch_headlines(topic: str, when: str = "3d") -> list[dict]:
    query = QUERY_OVERRIDES.get(topic, topic)
    url = RSS_URL.format(query=urllib.parse.quote(f"{query} when:{when}"))
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        xml_bytes = resp.read()

    root = ET.fromstring(xml_bytes)
    items = []
    for item in root.findall("./channel/item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        if not title or not link:
            continue

        source_el = item.find("source")
        source_name = source_el.text.strip() if source_el is not None and source_el.text else None
        if source_name and title.endswith(f" - {source_name}"):
            title = title[: -(len(source_name) + 3)].strip()

        pub_date_raw = item.findtext("pubDate")
        try:
            published_at = parsedate_to_datetime(pub_date_raw) if pub_date_raw else dt.datetime.utcnow()
        except (TypeError, ValueError):
            published_at = dt.datetime.utcnow()
        if published_at.tzinfo:
            published_at = published_at.astimezone(dt.timezone.utc).replace(tzinfo=None)

        items.append(dict(title=title, link=link, source=source_name, published_at=published_at))
    return items


def make_article(brand_id: int, topic: str, item: dict) -> Article:
    source = item["source"] or "a news source"
    body_md = (
        f"**{item['title']}**\n\n"
        f"{source} is reporting on this story. This brief was surfaced automatically "
        f"from real {topic} coverage — follow the link below for the full report.\n\n"
        f"[Read the full story at {source} →]({item['link']})"
    )
    return Article(
        brand_id=brand_id,
        slug=slugify(item["title"]),
        category=topic,
        title=item["title"],
        dek=f"Spotted in {topic} news via {source}.",
        body_md=body_md,
        author=source,
        published_at=item["published_at"],
        is_published=True,
    )


def ingest_brand(db, brand: Brand, per_topic: int) -> int:
    topics = [t.strip() for t in brand.topics.split(",") if t.strip()]
    # Tracked in memory (not just re-queried per item) because the session
    # is autoflush=False — the same headline can turn up under two topics
    # in one run (e.g. a Windows 11 story also tagged Copilot), and a DB
    # query wouldn't see a row this run already added-but-not-flushed.
    seen_slugs = {row[0] for row in db.query(Article.slug).filter(Article.brand_id == brand.id).all()}
    added = 0
    for topic in topics:
        try:
            items = fetch_headlines(topic)
        except Exception as exc:
            print(f"  [{brand.slug}/{topic}] fetch failed: {exc}", file=sys.stderr)
            continue

        new_for_topic = 0
        for item in items:
            if new_for_topic >= per_topic:
                break
            slug = slugify(item["title"])
            if slug in seen_slugs:
                continue
            db.add(make_article(brand.id, topic, item))
            seen_slugs.add(slug)
            new_for_topic += 1
            added += 1
        print(f"  [{brand.slug}/{topic}] +{new_for_topic} new (of {len(items)} found)")
    return added


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--brand", help="Single brand slug to ingest, e.g. fyimac")
    parser.add_argument("--all-brands", action="store_true", help="Ingest every brand in the network")
    parser.add_argument("--per-topic", type=int, default=3, help="Max new articles per topic per run (default 3)")
    args = parser.parse_args()

    if not args.brand and not args.all_brands:
        parser.error("pass --brand <slug> or --all-brands")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.all_brands:
            brands = db.query(Brand).all()
        else:
            brands = [b for b in [db.query(Brand).filter(Brand.slug == args.brand).first()] if b]

        if not brands:
            print("No matching brand(s) found — run `python -m app.seed` first.", file=sys.stderr)
            sys.exit(1)

        total = 0
        for brand in brands:
            print(f"Ingesting {brand.name} ({brand.slug})...")
            total += ingest_brand(db, brand, args.per_topic)
        db.commit()
        print(f"Done — {total} new article(s) added.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
