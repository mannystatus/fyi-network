"""
Run with: python -m app.diag_image_hosts

Read-only diagnostic: prints how many articles have an image_url, grouped
by host, and how many are None. Used to check for any remaining
Google-sourced thumbnails after the fetch_og_image fix + backfill_google_icon
cleanup (see those for context).
"""
import urllib.parse
from collections import Counter

from .database import SessionLocal
from .models import Article, Brand


def main() -> None:
    db = SessionLocal()
    try:
        hosts = Counter()
        by_brand_null = Counter()
        by_brand_total = Counter()
        brands = {b.id: b.slug for b in db.query(Brand).all()}
        for a in db.query(Article).all():
            by_brand_total[brands.get(a.brand_id, "?")] += 1
            if not a.image_url:
                by_brand_null[brands.get(a.brand_id, "?")] += 1
                continue
            host = urllib.parse.urlsplit(a.image_url).netloc
            hosts[host] += 1

        print("=== image_url host counts ===")
        for host, count in hosts.most_common(50):
            print(f"{count:5d}  {host}")

        print("\n=== articles with no image_url, by brand ===")
        for slug, total in by_brand_total.most_common():
            print(f"{slug:15s} {by_brand_null[slug]:4d} / {total:4d} missing")
    finally:
        db.close()


if __name__ == "__main__":
    main()
