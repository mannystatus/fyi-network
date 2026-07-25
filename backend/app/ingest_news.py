"""
Run with: python -m app.ingest_news --brand fyimac
      or: python -m app.ingest_news --all-brands

Automatically finds real, current news for each of a brand's topics (the
same comma-separated list stored on Brand.topics — Mac, iPhone, iPad, Apple
Watch, Services, ...) via Bing News RSS, no API key needed, and writes
short attributed articles straight into the same database the site reads
from — using each story's real publisher-written description as the body,
not just a headline-and-link stub. Re-running is safe: articles are
deduped by slug per brand, so already-seen headlines are skipped and only
genuinely new ones get added.

Bing is used instead of Google News RSS because Google's RSS <link> is a
JS-resolved redirect through news.google.com — there's no real content or
even a real URL to point to without executing JavaScript. Bing's RSS gives
a direct 302 redirect to the publisher (recovered here without a network
round trip, straight out of the link's own `url=` query param) and a real
2-3 sentence description written by the publisher for syndication. If Bing
is unreachable, this falls back to the old Google-News headline-only mode
so ingestion still produces something rather than failing outright.
"""
import argparse
import datetime as dt
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from html import unescape

from .database import Base, SessionLocal, engine, ensure_schema
from .models import Article, Brand
from .slugs import slugify

BING_RSS_URL = "https://www.bing.com/news/search?q={query}&format=RSS&qft=sortbydate%3d%221%22"
GOOGLE_RSS_URL = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
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
    "Apple TV+": "\"Apple TV+\" OR \"Apple TV Plus\"",
    "Services": "Apple Services App Store iCloud",
    "Windows 11": "Windows 11",
    "Hardware": "Windows PC laptop hardware",
    "Copilot": "Microsoft Copilot AI",
    "Pixel": "Google Pixel",
    "Chrome": "Google Chrome browser",
    "Android": "Android OS",
    "YouTube": "YouTube",
    "New Releases": "Netflix new releases",
    "Netflix Originals": "Netflix original series OR movie",
    "Renewals & Cancellations": "Netflix renewed OR canceled series",
    "Top 10": "Netflix Top 10 chart",
    "K-Drama": "K-drama premiere OR upcoming Korean drama OR must-watch K-drama",
    "Flight Deals": "flight deals OR cheap flights OR airfare sale",
    "Airline News": "airline news",
    "Travel Tips": "travel tips flying OR airport tips",
}

# Bing News search occasionally returns loosely-related filler when a topic
# has thin same-day coverage (e.g. a real-estate story with zero mention of
# Windows showing up for the "Windows 11" query). Require at least one of
# these substrings in the title+description before accepting a result.
FILTER_KEYWORDS = {
    "Mac": ["mac", "macbook"],
    "iPhone": ["iphone"],
    "iPad": ["ipad"],
    "Apple Watch": ["apple watch", "watchos"],
    "Apple TV+": ["apple tv+", "apple tv plus", "apple tv"],
    "Services": ["apple", "icloud", "app store", "apple music", "apple tv"],
    "Windows 11": ["windows"],
    "Hardware": ["laptop", "pc", "processor", "chip", "hardware", "desktop"],
    "Copilot": ["copilot"],
    "Pixel": ["pixel"],
    "Chrome": ["chrome"],
    "Android": ["android"],
    "YouTube": ["youtube"],
    # These topic names are generic on their own ("Top 10" of what?), so
    # require "netflix" itself rather than a softer product keyword.
    "New Releases": ["netflix"],
    "Netflix Originals": ["netflix"],
    "Renewals & Cancellations": ["netflix"],
    "Top 10": ["netflix"],
    "K-Drama": ["k-drama", "kdrama", "korean drama"],
    "Flight Deals": ["flight", "flights", "airfare", "fare"],
    "Airline News": ["airline", "airlines"],
    "Travel Tips": ["travel", "flight", "airport", "flying", "trip"],
}

# A product keyword can show up in a story that has nothing to do with the
# product — e.g. "the victim's Apple Watch" in a true-crime writeup. These
# almost never appear in legitimate tech coverage, so any match here drops
# the item regardless of whether a FILTER_KEYWORDS term also matched.
EXCLUDE_KEYWORDS = ["ransom", "kidnap", "murder", "homicide", "manhunt", "crime podcast", "missing person"]

# Dedicated trade press for a topic covers it accurately without necessarily
# repeating the topic's own name in every headline (a Soompi casting brief
# says "confirmed for new drama", not "Korean drama confirmed") — the
# FILTER_KEYWORDS check alone drops these as false negatives. A source match
# here is accepted outright, skipping the keyword requirement.
TRUSTED_SOURCES = {
    "K-Drama": ["soompi", "allkpop", "koreaboo", "korea herald", "koreajoongangdaily"],
}


def is_relevant(topic: str, item: dict) -> bool:
    haystack = f"{item['title']} {item['description'] or ''}".lower()
    if any(k in haystack for k in EXCLUDE_KEYWORDS):
        return False
    trusted = TRUSTED_SOURCES.get(topic)
    if trusted and item["source"] and any(s in item["source"].lower() for s in trusted):
        return True
    keywords = FILTER_KEYWORDS.get(topic)
    if not keywords:
        return True
    return any(k in haystack for k in keywords)


# Some publishers' RSS descriptions splice unrelated newsletter/CTA copy
# straight onto the end of the real excerpt with no separating space (e.g.
# "...as your scores change.The Latest Tech News, Delivered..."). Cut the
# description off at the first such marker rather than shipping it.
_BOILERPLATE_MARKERS = (
    "sign up for", "subscribe to", "the latest tech news", "delivered to your inbox",
    "follow us on", "click here to", "read more:", "related:",
)


def clean_description(text: str) -> str:
    text = re.sub(r"([a-z0-9])\.([A-Z])", r"\1. \2", text)
    lowered = text.lower()
    cut = min((idx for m in _BOILERPLATE_MARKERS if (idx := lowered.find(m)) != -1), default=len(text))
    return text[:cut].rstrip(" ,;:")


def _local_name(tag: str) -> str:
    return tag.split("}")[-1] if "}" in tag else tag


def _parse_pub_date(raw: str | None) -> dt.datetime:
    try:
        published_at = parsedate_to_datetime(raw) if raw else dt.datetime.utcnow()
    except (TypeError, ValueError):
        return dt.datetime.utcnow()
    if published_at.tzinfo:
        published_at = published_at.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return published_at


def _get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()


def fetch_bing(topic: str) -> list[dict]:
    query = QUERY_OVERRIDES.get(topic, topic)
    url = BING_RSS_URL.format(query=urllib.parse.quote(query))
    root = ET.fromstring(_get(url))

    items = []
    for item in root.findall("./channel/item"):
        title = unescape((item.findtext("title") or "").strip())
        raw_link = (item.findtext("link") or "").strip()
        description = clean_description(unescape((item.findtext("description") or "").strip()))
        if not title or not raw_link:
            continue

        # Bing's RSS <link> is a bing.com/apiclick.aspx redirector — the real
        # publisher URL is already sitting in its own `url=` query param, so
        # this recovers it without an extra network round trip.
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_link).query)
        link = qs.get("url", [raw_link])[0]

        source_name = None
        for child in item:
            if _local_name(child.tag) == "Source":
                source_name = (child.text or "").strip() or None
                break

        items.append(
            dict(
                title=title,
                link=link,
                source=source_name,
                description=description or None,
                published_at=_parse_pub_date(item.findtext("pubDate")),
            )
        )
    return items


def fetch_google_fallback(topic: str, when: str = "3d") -> list[dict]:
    query = QUERY_OVERRIDES.get(topic, topic)
    url = GOOGLE_RSS_URL.format(query=urllib.parse.quote(f"{query} when:{when}"))
    root = ET.fromstring(_get(url))

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

        items.append(
            dict(
                title=title,
                link=link,
                source=source_name,
                description=None,
                published_at=_parse_pub_date(item.findtext("pubDate")),
            )
        )
    return items


def fetch_headlines(topic: str) -> list[dict]:
    try:
        items = fetch_bing(topic)
        if items:
            return items
    except Exception as exc:
        print(f"    (bing fetch failed for {topic!r}: {exc} — falling back to Google News)", file=sys.stderr)
    return fetch_google_fallback(topic)


def first_sentence(text: str, limit: int = 160) -> str:
    match = re.match(r"(.{1,%d}?[.!?])(\s|$)" % limit, text)
    if match:
        return match.group(1)
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def make_article(brand_id: int, topic: str, item: dict) -> Article:
    source = item["source"] or "a news source"
    description = item["description"]

    if description:
        # Separate paragraphs (not one line wrapping both in italics) so the
        # "read the full story" link stays its own <p><a>-only child> — that's
        # what the CSS keys off of to style it as a button, not inline text.
        body_md = f"{description}\n\n*Reported by {source}.*\n\n[Read the full story →]({item['link']})"
        dek = first_sentence(description)
    else:
        body_md = (
            f"{source} is reporting on this story. This brief was surfaced automatically "
            f"from real {topic} coverage — follow the link below for the full report.\n\n"
            f"[Read the full story at {source} →]({item['link']})"
        )
        dek = f"Spotted in {topic} news via {source}."

    return Article(
        brand_id=brand_id,
        slug=slugify(item["title"]),
        category=topic,
        title=item["title"],
        dek=dek,
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
            if not is_relevant(topic, item):
                continue
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
    ensure_schema(engine)
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
