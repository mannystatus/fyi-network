"""
Run with: python -m app.backfill_google_icon

One-off cleanup for a bug in ingest_news.fetch_og_image (now fixed): articles
that came through the Google News RSS fallback had their `link` still
pointing at an unresolved news.google.com redirect, so the "no thumbnail,
go scrape og:image" step fetched Google's own interstitial page and stored
its generic share icon (a colored-cards "G" logo) as the article thumbnail
instead of leaving image_url blank. This nulls those rows out so the
frontend renders them the same as any other imageless article (text-only
card, no broken/wrong-brand thumbnail).
"""
from .database import Base, SessionLocal, engine, ensure_schema
from .ingest_news import _GENERIC_ICON_HOSTS
from .models import Article

import urllib.parse


def main() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        candidates = db.query(Article).filter(Article.image_url.isnot(None)).all()
        cleared = []
        for article in candidates:
            host = urllib.parse.urlsplit(article.image_url).netloc
            if host in _GENERIC_ICON_HOSTS:
                cleared.append(f"{article.slug} ({article.image_url})")
                article.image_url = None
        db.commit()
        print(f"Cleared {len(cleared)} of {len(candidates)} imaged articles:")
        for line in cleared:
            print(f"  - {line}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
