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
import hashlib
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
#
# Sports brands share generic topic vocabulary ("Team News", "Trade Rumors",
# ...) across brands on purpose — it reads better as a nav pill on an
# already-team-branded site than "Lakers Team News" would. That means a
# bare topic-string key would collide between brands (Dodgers' "Team News"
# would inherit the Lakers query). Entries that need to differ per brand are
# keyed (brand_slug, topic) instead; see _brand_lookup below, which checks
# that first and falls back to the plain-topic key for every brand that
# doesn't have this collision (Mac, Windows, etc. — one query fits all).
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
    "Xbox": "Xbox OR \"Xbox Series X\" OR \"Xbox Game Pass\" OR Xbox deals",
    "PC Gaming": "PC gaming OR Steam deals OR Steam sale OR PC game release",
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
    ("fyilakers", "Team News"): "Los Angeles Lakers news",
    ("fyilakers", "Trade Rumors"): "Los Angeles Lakers trade rumors",
    ("fyilakers", "Injury Report"): "Los Angeles Lakers injury report",
    ("fyilakers", "Game Recaps"): "Los Angeles Lakers game recap",
    ("fyilakers", "Draft & Free Agency"): "Los Angeles Lakers draft OR free agency",
    ("fyidodgers", "Team News"): "Los Angeles Dodgers news",
    ("fyidodgers", "Trade Rumors"): "Los Angeles Dodgers trade rumors",
    ("fyidodgers", "Injury Report"): "Los Angeles Dodgers injury report",
    ("fyidodgers", "Game Recaps"): "Los Angeles Dodgers game recap",
    ("fyidodgers", "Prospects & Free Agency"): "Los Angeles Dodgers prospects OR free agency",
    # Bare "camera"/"lens" queries return mostly surveillance/wildlife/dashcam
    # and smartphone-camera noise (Bing's ranking treats "camera" as a very
    # common word). Anchoring the query itself on real ILC gear terms and
    # manufacturer names cuts through that before FILTER_KEYWORDS even runs.
    "News": "mirrorless camera OR DSLR camera OR Canon EOS OR Sony Alpha OR Nikon Z OR Fujifilm X camera",
    "New Gear": "new mirrorless camera announcement OR new camera lens OR Canon EOS OR Sony Alpha OR Nikon Z",
    "Buying Guides": "best mirrorless camera OR best DSLR camera guide",
    "Rumors": "mirrorless camera rumor OR Canon EOS rumor OR Sony Alpha rumor OR Nikon Z rumor OR Fujifilm rumor",
}

# Dedicated manufacturer rumor mills, pulled straight from their own RSS
# feeds rather than through Bing News search — Bing News doesn't index these
# small independent blogs at all (a `site:` filter in the Bing query just
# returns zero hits), so search-based discovery can never surface them.
# sonyrumors.com itself no longer resolves to a rumor site (parked/redirected
# domain); sonyalpharumors.com ("SAR") is the actual long-running Sony rumor
# outlet, hence the mismatched (site, source name) pairing below.
DIRECT_RSS_FEEDS = {
    ("fyicams", "Rumors"): [
        ("https://leicarumors.com/feed/", "Leica Rumors"),
        ("https://www.sonyalpharumors.com/feed/", "sonyalpharumors"),
        ("https://www.fujirumors.com/feed/", "Fuji Rumors"),
        ("https://nikonrumors.com/feed/", "Nikon Rumors"),
    ],
}


def _brand_lookup(mapping: dict, brand_slug: str, topic: str):
    """(brand_slug, topic) takes priority over a plain-topic key, for the
    handful of topic names shared across brands (see QUERY_OVERRIDES)."""
    if (brand_slug, topic) in mapping:
        return mapping[(brand_slug, topic)]
    return mapping.get(topic)

# Shared by all four fyiCams topics below — bare "camera"/"lens"/"sensor"
# match far too much unrelated news ("caught on camera" crime stories,
# eyeglass lenses, phone chip sensors), so this requires either a specific
# photography-gear term or a real camera-maker name instead.
CAMERA_GEAR_KEYWORDS = [
    "mirrorless",
    "dslr",
    "camera lens",
    "camera body",
    "full-frame camera",
    "aps-c",
    # "megapixel"/"aperture" deliberately excluded — smartphone marketing
    # copy uses both just as often as real camera-gear coverage does (a
    # phone's "200MP camera" leak matched "megapixel" and slipped a phone
    # story onto a dedicated-camera site before this was narrowed).
    "canon eos",
    "nikon z",
    "sony alpha",
    "fujifilm",
    "panasonic lumix",
    "olympus om",
    "leica",
    "gopro",
    "hasselblad",
]

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
    "Xbox": ["xbox"],
    # "PC Gaming" alone is too broad (bare "pc" pulls in any PC hardware
    # story) — require a term that's actually about gaming on it. Bare
    # "steam" was tried first and let through "gaining steam"/"picking up
    # steam" idioms in unrelated stories (a Reds trade-prospect piece, of
    # all things) — every variant below is specific enough that it doesn't
    # occur in that idiom.
    "PC Gaming": ["pc gaming", "steam deck", "steam sale", "steam game", "on steam", "gaming pc", "gaming laptop"],
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
    # "Team News" and "Game Recaps" are generic enough to pull in unrelated
    # results (recaps of other games, other teams' "news") without requiring
    # the team name itself, same reasoning as Netflix's topics above. Keyed
    # per-brand — see QUERY_OVERRIDES comment above on why.
    ("fyilakers", "Team News"): ["lakers"],
    ("fyilakers", "Trade Rumors"): ["lakers"],
    ("fyilakers", "Injury Report"): ["lakers"],
    ("fyilakers", "Game Recaps"): ["lakers"],
    ("fyilakers", "Draft & Free Agency"): ["lakers"],
    ("fyidodgers", "Team News"): ["dodgers"],
    ("fyidodgers", "Trade Rumors"): ["dodgers"],
    ("fyidodgers", "Injury Report"): ["dodgers"],
    ("fyidodgers", "Game Recaps"): ["dodgers"],
    ("fyidodgers", "Prospects & Free Agency"): ["dodgers"],
    # Bare "camera"/"lens"/"sensor" are too generic on their own — "caught
    # on camera" (surveillance/crime stories), "lens of history" (metaphor),
    # and phone/chip "sensor" news all slip through a plain-word filter.
    # Require an actual photography-gear term or a real camera-maker name.
    "News": CAMERA_GEAR_KEYWORDS,
    "New Gear": CAMERA_GEAR_KEYWORDS,
    "Buying Guides": CAMERA_GEAR_KEYWORDS,
    "Rumors": CAMERA_GEAR_KEYWORDS,
}

# A product keyword can show up in a story that has nothing to do with the
# product — e.g. "the victim's Apple Watch" in a true-crime writeup. These
# almost never appear in legitimate tech coverage, so any match here drops
# the item regardless of whether a FILTER_KEYWORDS term also matched.
EXCLUDE_KEYWORDS = ["ransom", "kidnap", "murder", "homicide", "manhunt", "crime podcast", "missing person"]

# Bing (and the Google fallback) return results in whatever language the
# query term is trending in worldwide — a global product name like "Google
# Pixel" pulls in German, Hindi, etc. coverage just as easily as English,
# and that foreign text still contains the plain-ASCII product keyword
# (e.g. "Google-Pixel-Nutzer"), so FILTER_KEYWORDS alone lets it through.
# Two independent signals catch it: any character from a non-Latin script
# rejects outright (unambiguous — no legitimate English headline uses
# Devanagari, Cyrillic, CJK, etc.); a cluster of German stopwords/umlauts
# catches German specifically, which is written in Latin script so the
# script check alone would miss it. A single incidental hit (e.g. "das" as
# a rare English fragment) isn't enough on its own.
_NON_LATIN_SCRIPT = re.compile(
    "[Ѐ-ӿ֐-׿؀-ۿऀ-ॿ぀-ヿ一-鿿가-힣]"
)
_GERMAN_MARKERS = re.compile(
    r"[äöüßÄÖÜ]|\b(und|der|die|das|ist|nicht|für|auf|mit|wird|sein|eine|einen|kann|sollten|dieser)\b",
    re.IGNORECASE,
)


def is_english(text: str) -> bool:
    if _NON_LATIN_SCRIPT.search(text):
        return False
    return len(_GERMAN_MARKERS.findall(text)) < 2

# Dedicated trade press for a topic covers it accurately without necessarily
# repeating the topic's own name in every headline (a Soompi casting brief
# says "confirmed for new drama", not "Korean drama confirmed") — the
# FILTER_KEYWORDS check alone drops these as false negatives. A source match
# here is accepted outright, skipping the keyword requirement.
CAMERA_TRADE_SOURCES = [
    "digital camera world", "digital photography review", "dpreview", "petapixel",
    "fstoppers", "newsshooter", "kosmo foto", "redshark news", "imaging resource",
    "photography news", "british journal of photography", "amateur photographer",
]

# Manufacturer-specific rumor mills — their headlines often name only a model
# number ("A7V", "Z9 III") without the maker's full brand phrase that
# CAMERA_GEAR_KEYWORDS requires, so a keyword match can't be relied on. A
# source match here is trusted outright instead, same as CAMERA_TRADE_SOURCES.
# Names must match the channel <title> each feed actually publishes — see
# DIRECT_RSS_FEEDS below.
CAMERA_RUMOR_SOURCES = ["leica rumors", "sonyalpharumors", "fuji rumors", "nikon rumors"]

TRUSTED_SOURCES = {
    "K-Drama": ["soompi", "allkpop", "koreaboo", "korea herald", "koreajoongangdaily"],
    "News": CAMERA_TRADE_SOURCES,
    "New Gear": CAMERA_TRADE_SOURCES,
    "Buying Guides": CAMERA_TRADE_SOURCES,
    "Rumors": CAMERA_TRADE_SOURCES + CAMERA_RUMOR_SOURCES,
}

# Editorial-only topics: no RSS query makes sense for these (there's no
# newswire for "our own staff's opinion"), so ingestion skips them entirely
# rather than searching the topic name literally and pulling in unrelated
# junk attributed to random outlets. Populated only by hand via /admin.
# fyiFlyNow's "Travel Guides" is skipped here for a different reason — it's
# fed by the separate YouTube creator pipeline (see ingest_youtube.py), not
# a news search.
MANUAL_ONLY_TOPICS = {"Staff Reviews", "Travel Guides"}

# A short, original sentence prepended to every ingested article's body —
# the syndicated description itself already exists verbatim on the
# publisher's own site (and often other aggregators too), so a page with
# nothing but that snippet reads as pure duplicate content to Google, which
# crawls it but declines to index it. This line is the one piece of text
# that's genuinely ours. Picked deterministically per article (hash of its
# slug, not random) so re-running ingestion — which already dedupes by slug
# — never changes an already-chosen framing for a given headline.
FRAMING_TEMPLATES = [
    "{brand} is tracking this {topic} development:",
    "Here's what's new in {topic} right now, as seen by {brand}:",
    "{brand}'s {topic} watch: a new headline just crossed the wire.",
    "In {topic} news, here's the latest {brand} is following:",
    "One more {topic} story worth a look, via {brand}:",
]


def pick_framing(slug: str, brand_name: str, topic: str) -> str:
    # Python's builtin hash() is randomized per-process for strings (security
    # feature, see PYTHONHASHSEED) — unusable here since this needs to pick
    # the *same* template for the same slug across separate runs. md5 isn't
    # for security here, just a stable, well-distributed digest.
    digest = hashlib.md5(slug.encode()).hexdigest()
    template = FRAMING_TEMPLATES[int(digest, 16) % len(FRAMING_TEMPLATES)]
    return template.format(brand=brand_name, topic=topic)


def is_relevant(brand_slug: str, topic: str, item: dict) -> bool:
    raw_text = f"{item['title']} {item['description'] or ''}"
    if not is_english(raw_text):
        return False
    haystack = raw_text.lower()
    if any(k in haystack for k in EXCLUDE_KEYWORDS):
        return False
    trusted = TRUSTED_SOURCES.get(topic)
    if trusted and item["source"] and any(s in item["source"].lower() for s in trusted):
        return True
    keywords = _brand_lookup(FILTER_KEYWORDS, brand_slug, topic)
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


def fetch_bing(brand_slug: str, topic: str) -> list[dict]:
    query = _brand_lookup(QUERY_OVERRIDES, brand_slug, topic) or topic
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
        image_url = None
        for child in item:
            tag = _local_name(child.tag)
            if tag == "Source" and source_name is None:
                source_name = (child.text or "").strip() or None
            elif tag == "Image" and image_url is None:
                # Bing News RSS's own <News:Image> thumbnail — same feed
                # item, no extra fetch needed to get a real article image
                # instead of leaving image_url blank.
                image_url = (child.text or "").strip() or None

        items.append(
            dict(
                title=title,
                link=link,
                source=source_name,
                description=description or None,
                published_at=_parse_pub_date(item.findtext("pubDate")),
                image_url=image_url,
            )
        )
    return items


def fetch_google_fallback(brand_slug: str, topic: str, when: str = "3d") -> list[dict]:
    query = _brand_lookup(QUERY_OVERRIDES, brand_slug, topic) or topic
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
                image_url=None,  # Google News RSS items carry no thumbnail
            )
        )
    return items


_HTML_TAG_RE = re.compile(r"<[^>]+>")


def fetch_direct_rss(feed_url: str, source_name: str) -> list[dict]:
    """A specific outlet's own RSS feed, for sources Bing News doesn't index
    at all (see DIRECT_RSS_FEEDS) rather than one more query term to search
    for."""
    root = ET.fromstring(_get(feed_url))

    items = []
    for item in root.findall("./channel/item"):
        title = unescape((item.findtext("title") or "").strip())
        link = (item.findtext("link") or "").strip()
        if not title or not link:
            continue
        raw_description = unescape((item.findtext("description") or "").strip())
        description = clean_description(_HTML_TAG_RE.sub("", raw_description).strip())
        items.append(
            dict(
                title=title,
                link=link,
                source=source_name,
                description=description or None,
                published_at=_parse_pub_date(item.findtext("pubDate")),
                image_url=None,
            )
        )
    return items


_OG_IMAGE_RE = re.compile(
    r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
# Same tag, attributes in the opposite order (content= before property=) —
# publishers aren't consistent about which comes first.
_OG_IMAGE_RE_REV = re.compile(
    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image["\']',
    re.IGNORECASE,
)


def fetch_og_image(article_url: str) -> str | None:
    """Fallback for feeds that carry no thumbnail of their own (direct-RSS
    rumor blogs, Google News fallback): fetch the article page itself and
    pull its social-share og:image, same size the publisher considers
    presentable rather than whatever a feed happened to include."""
    try:
        html = _get(article_url).decode("utf-8", errors="ignore")
    except Exception:
        return None
    match = _OG_IMAGE_RE.search(html) or _OG_IMAGE_RE_REV.search(html)
    return unescape(match.group(1).strip()) or None if match else None


def fetch_headlines(brand_slug: str, topic: str) -> list[dict]:
    try:
        items = fetch_bing(brand_slug, topic)
        if not items:
            items = fetch_google_fallback(brand_slug, topic)
    except Exception as exc:
        print(f"    (bing fetch failed for {topic!r}: {exc} — falling back to Google News)", file=sys.stderr)
        items = fetch_google_fallback(brand_slug, topic)

    for feed_url, source_name in _brand_lookup(DIRECT_RSS_FEEDS, brand_slug, topic) or []:
        try:
            items += fetch_direct_rss(feed_url, source_name)
        except Exception as exc:
            print(f"    (direct feed fetch failed for {source_name!r}: {exc})", file=sys.stderr)

    return items


def first_sentence(text: str, limit: int = 160) -> str:
    match = re.match(r"(.{1,%d}?[.!?])(\s|$)" % limit, text)
    if match:
        return match.group(1)
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def make_article(brand: Brand, topic: str, item: dict) -> Article:
    source = item["source"] or "a news source"
    description = item["description"]
    slug = slugify(item["title"])
    framing = pick_framing(slug, brand.name, topic)

    if description:
        # Separate paragraphs (not one line wrapping both in italics) so the
        # "read the full story" link stays its own <p><a>-only child> — that's
        # what the CSS keys off of to style it as a button, not inline text.
        body_md = f"{framing}\n\n{description}\n\n*Reported by {source}.*\n\n[Read the full story →]({item['link']})"
        dek = first_sentence(description)
    else:
        body_md = (
            f"{framing} {source} is reporting on this story. This brief was surfaced "
            f"automatically from real {topic} coverage — follow the link below for the full "
            f"report.\n\n[Read the full story at {source} →]({item['link']})"
        )
        dek = f"Spotted in {topic} news via {source}."

    return Article(
        brand_id=brand.id,
        slug=slug,
        category=topic,
        title=item["title"],
        dek=dek,
        body_md=body_md,
        author=source,
        published_at=item["published_at"],
        is_published=True,
        image_url=item.get("image_url"),
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
        if topic in MANUAL_ONLY_TOPICS:
            continue
        try:
            items = fetch_headlines(brand.slug, topic)
        except Exception as exc:
            print(f"  [{brand.slug}/{topic}] fetch failed: {exc}", file=sys.stderr)
            continue

        new_for_topic = 0
        for item in items:
            if new_for_topic >= per_topic:
                break
            if not is_relevant(brand.slug, topic, item):
                continue
            slug = slugify(item["title"])
            if slug in seen_slugs:
                continue
            if not item.get("image_url"):
                item["image_url"] = fetch_og_image(item["link"])
            db.add(make_article(brand, topic, item))
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
