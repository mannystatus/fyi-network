"""
Run with: python -m app.ingest_youtube
      or: python -m app.ingest_youtube --channel AbroadinJapan --limit 1

Pulls new uploads from fyiFlyNow's curated travel-creator channels via each
channel's public YouTube RSS feed (no API key needed for that part), fetches
the video's transcript, and asks Gemini to turn it into a short, practical
written travel guide. Writes straight into fyiflynow's "Travel Guides" topic
— see MANUAL_ONLY_TOPICS in ingest_news.py, which skips that topic so the
two pipelines never collide on the same category. Re-running is safe:
articles are deduped by slug per brand, same as ingest_news.py.

Needs GEMINI_API_KEY set (exits cleanly, doing nothing, if it isn't — same
pattern as send_game_alerts.py's VAPID-key check). Uses Google AI Studio's
free tier, not a paid API. A video with no transcript available (captions
off, or YouTube blocking the request) is skipped with a warning rather than
failing the whole run — this uses the unofficial youtube-transcript-api,
which isn't Google-sanctioned and can be rate-limited more aggressively
from datacenter IPs (e.g. GitHub Actions runners) than from a residential
connection.
"""
import argparse
import datetime as dt
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape

from google import genai
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    RequestBlocked,
    TranscriptsDisabled,
    VideoUnavailable,
)

from .database import Base, SessionLocal, engine, ensure_schema
from .models import Article, Brand
from .slugs import slugify

BRAND_SLUG = "fyiflynow"
TOPIC = "Travel Guides"
FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
USER_AGENT = "Mozilla/5.0 (compatible; fyi-network-ingest/1.0)"
# The "-latest" alias tracks whatever Google's current recommended flash
# model is, rather than a pinned version — confirmed by hand that a pinned
# "gemini-2.5-flash" 404s for this (newly-created) API key/account with
# "no longer available to new users", despite still being listed by
# client.models.list().
SUMMARY_MODEL = "gemini-flash-latest"

# handle -> (channel ID, display name used as the article's byline). Channel
# IDs resolved from each @handle's canonical link and cross-checked against
# the feed's own <title> — see the PR/commit this was added in if a handle
# ever needs re-resolving (creators do occasionally change their @handle).
CHANNELS: dict[str, tuple[str, str]] = {
    "AbroadinJapan": ("UCHL9bfHTxCMi-7vfxQ-AYtg", "Abroad in Japan"),
    "RionIshida": ("UCl7m8jh1FfIyEfCpHevrK1w", "Rion Ishida"),
    "Justdreamitaly": ("UCLJcPtF9ylShScEeyKkWAng", "Just Dream Italy"),
    "GabrielTravelerVideos": ("UCgZM50Ig7STDS0l6f_QnrXw", "Gabriel Traveler"),
    "SolLife_": ("UC14-B_3C30cxZGuFJR0I-Ug", "Sol Life"),
    "JanandAnn": ("UCfO7GbFUi2VUXQq92lrQkIg", "Jan and Ann"),
    "laistahir": ("UCD5X8jv4jFh95ZDpTL1b7Qg", "Lais"),
    "SamandVictor": ("UCfQx-K9zBExhMLfKQmXBxJg", "Sam and Victor"),
    "maliniangelica1": ("UCdaxLVMrpOk1ODGaR3FiZ6g", "Malini Angelica"),
    "4KJAPAN": ("UCoXm66ArnAYGC0SCItOb2Tg", "4K JAPAN"),
    "PackHacker": ("UC_rI3y1DzDULTr-UIvshiwg", "Pack Hacker"),
    "LisaAndJosh": ("UCmFVeAWxiBM9wkS1OeJKhUg", "Lisa and Josh"),
    "DotsonaMap": ("UCmf0FVB5zt6Ltq7RooWvc0g", "Dots on a Map"),
    "DWTravel": ("UCAjA4SbeRNqig8NdNszDBsA", "DW Travel"),
}

ATOM_NS = {
    "a": "http://www.w3.org/2005/Atom",
    "media": "http://search.yahoo.com/mrss/",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}

SUMMARY_SYSTEM_PROMPT = """\
You turn YouTube travel video transcripts into short, practical written \
travel guides for a travel news website. Write in plain, direct prose — no \
headers, no bullet lists, no emoji, no markdown formatting. Focus on \
concrete, useful information a traveler could act on (places, costs, \
timing, practical tips) rather than describing what happens in the video. \
Never refer to "the video", "the creator", "in this clip", or similar — \
write as original travel guide copy. Do not invent facts that aren't in \
the transcript; if the transcript is thin, write a shorter guide rather \
than padding it.

Respond in exactly this format, nothing else:

TEASER: <one sentence, under 160 characters, written as an article dek>
GUIDE:
<2 to 4 short paragraphs, separated by blank lines>\
"""


def _get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()


def _parse_published(raw: str | None) -> dt.datetime:
    if not raw:
        return dt.datetime.utcnow()
    try:
        parsed = dt.datetime.fromisoformat(raw)
    except ValueError:
        return dt.datetime.utcnow()
    if parsed.tzinfo:
        parsed = parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return parsed


def fetch_feed_entries(channel_id: str) -> list[dict]:
    root = ET.fromstring(_get(FEED_URL.format(channel_id=channel_id)))
    entries = []
    for entry in root.findall("a:entry", ATOM_NS):
        video_id = entry.findtext("yt:videoId", namespaces=ATOM_NS)
        title = unescape((entry.findtext("a:title", namespaces=ATOM_NS) or "").strip())
        if not video_id or not title:
            continue

        link_el = entry.find("a:link[@rel='alternate']", ATOM_NS)
        url = link_el.get("href") if link_el is not None else f"https://www.youtube.com/watch?v={video_id}"

        thumbnail = None
        media_group = entry.find("media:group", ATOM_NS)
        if media_group is not None:
            thumb_el = media_group.find("media:thumbnail", ATOM_NS)
            if thumb_el is not None:
                thumbnail = thumb_el.get("url")

        entries.append(
            dict(
                video_id=video_id,
                title=title,
                url=url,
                thumbnail=thumbnail,
                published_at=_parse_published(entry.findtext("a:published", namespaces=ATOM_NS)),
            )
        )
    return entries


def fetch_transcript_text(video_id: str) -> str | None:
    try:
        fetched = YouTubeTranscriptApi().fetch(video_id, languages=["en", "en-US", "en-GB"])
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        return None
    except RequestBlocked:
        # YouTube is blocking this IP outright (routine on datacenter IPs
        # like GitHub Actions runners) — not a per-video condition, so
        # there's no point retrying the next video with the same IP.
        # Re-raised rather than swallowed so the caller can abort the whole
        # run instead of burning through every channel for nothing.
        raise
    except Exception as exc:
        print(f"    transcript fetch failed for {video_id}: {type(exc).__name__}: {exc}", file=sys.stderr)
        return None
    text = " ".join(snippet.text.strip() for snippet in fetched.snippets if snippet.text)
    return text or None


def summarize(client: genai.Client, title: str, creator: str, transcript: str) -> tuple[str, str]:
    # Caps input size — a 20-30 min travel vlog transcript can run tens of
    # thousands of characters, and the practical, actionable content is
    # almost always front-loaded rather than at the very end.
    excerpt = transcript[:12000]
    response = client.models.generate_content(
        model=SUMMARY_MODEL,
        config=genai.types.GenerateContentConfig(
            system_instruction=SUMMARY_SYSTEM_PROMPT,
            # This model spends output-token budget on hidden "thinking"
            # before the visible answer (confirmed by hand: ~1000-1400
            # thoughts_token_count on a typical transcript) — max_output_tokens
            # has to cover both or the response gets cut off mid-guide with
            # finish_reason=MAX_TOKENS. thinking_budget=0 isn't accepted by
            # this model (400 INVALID_ARGUMENT), so this caps it small
            # instead of disabling it outright.
            max_output_tokens=3000,
            thinking_config=genai.types.ThinkingConfig(thinking_budget=200),
        ),
        contents=f"Video title: {title}\nCreator: {creator}\n\nTranscript:\n{excerpt}",
    )
    text = (response.text or "").strip()

    teaser, _, rest = text.partition("GUIDE:")
    teaser = teaser.replace("TEASER:", "").strip()
    guide = rest.strip()
    if not teaser or not guide:
        raise ValueError(f"unexpected summary format from model: {text[:200]!r}")
    return teaser, guide


def make_article(brand: Brand, creator_name: str, creator_url: str, video: dict, dek: str, guide_body: str) -> Article:
    title = video["title"].rstrip(".")
    body_md = (
        f"{guide_body}\n\n"
        f"*Guide adapted from [{creator_name}]({creator_url})'s video "
        f'"{title}."*\n\n'
        f"[Watch the full video on YouTube →]({video['url']})"
    )
    return Article(
        brand_id=brand.id,
        slug=slugify(video["title"]),
        category=TOPIC,
        title=video["title"],
        dek=dek,
        body_md=body_md,
        author=creator_name,
        published_at=video["published_at"],
        is_published=True,
        image_url=video["thumbnail"],
    )


def ingest_channel(
    db, brand: Brand, client: genai.Client, handle: str, channel_id: str, creator_name: str, limit: int
) -> int:
    try:
        entries = fetch_feed_entries(channel_id)
    except Exception as exc:
        print(f"  [{handle}] feed fetch failed: {exc}", file=sys.stderr)
        return 0

    seen_slugs = {row[0] for row in db.query(Article.slug).filter(Article.brand_id == brand.id).all()}
    creator_url = f"https://www.youtube.com/channel/{channel_id}"
    added = 0
    for video in entries:
        if added >= limit:
            break
        slug = slugify(video["title"])
        if slug in seen_slugs:
            continue

        transcript = fetch_transcript_text(video["video_id"])
        if not transcript:
            print(f"  [{handle}] skipping {video['title']!r} — no transcript available")
            continue

        try:
            dek, guide_body = summarize(client, video["title"], creator_name, transcript)
        except Exception as exc:
            print(f"  [{handle}] summarization failed for {video['title']!r}: {exc}", file=sys.stderr)
            continue

        db.add(make_article(brand, creator_name, creator_url, video, dek, guide_body))
        seen_slugs.add(slug)
        added += 1
        print(f"  [{handle}] +1 {video['title']!r}")
    return added


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--channel", help="Only ingest this one channel handle, e.g. AbroadinJapan")
    parser.add_argument(
        "--limit", type=int, default=1, help="Max new videos per channel per run (default 1 — transcript fetch + summarization is the expensive step)"
    )
    args = parser.parse_args()

    if args.channel and args.channel not in CHANNELS:
        parser.error(f"unknown channel {args.channel!r} — known: {', '.join(CHANNELS)}")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set — nothing to do.", file=sys.stderr)
        return 0

    client = genai.Client(api_key=api_key)

    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        brand = db.query(Brand).filter(Brand.slug == BRAND_SLUG).first()
        if not brand:
            print("fyiflynow brand not found — run `python -m app.seed` first.", file=sys.stderr)
            return 1

        channels = {args.channel: CHANNELS[args.channel]} if args.channel else CHANNELS
        total = 0
        for handle, (channel_id, creator_name) in channels.items():
            print(f"Checking @{handle} ({creator_name})...")
            try:
                total += ingest_channel(db, brand, client, handle, channel_id, creator_name, args.limit)
            except RequestBlocked:
                db.commit()  # keep whatever was already added before the block hit
                print(
                    "YouTube is blocking transcript requests from this machine's IP — routine for "
                    "datacenter IPs (this includes GitHub Actions runners). Not fixable by retrying; "
                    "needs either a residential proxy (see youtube-transcript-api's README, "
                    "'Working around IP bans') or running this script from a non-datacenter machine. "
                    f"Stopping here — {total} article(s) added before the block.",
                    file=sys.stderr,
                )
                return 1
        db.commit()
        print(f"Done — {total} new article(s) added.")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
