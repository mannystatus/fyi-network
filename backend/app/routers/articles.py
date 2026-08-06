import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Article, Brand
from ..schemas import ArticleListItem, ArticleDetail, ArticleCreate, ArticleCreateResult, ArticleUpdate
from ..deps import resolve_brand
from ..auth import AdminScope, require_admin
from ..slugs import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])

DEFAULT_AUTHOR = "Manny Contreras"


@router.get("", response_model=list[ArticleListItem])
def list_articles(
    db: Session = Depends(get_db),
    brand: Brand = Depends(resolve_brand),
    category: str | None = Query(default=None, description="Filter to one topic/category, e.g. ?category=Mac"),
    q: str | None = Query(default=None, description="Search title/dek/body, e.g. ?q=iphone"),
    featured_only: bool = Query(
        default=False,
        description="Only hand-authored fyi staff articles (is_featured) — excludes automated RSS-ingested briefs.",
    ),
    limit: int = 20,
    offset: int = Query(default=0, ge=0, description="Skip this many, for pagination"),
):
    query = db.query(Article).filter(Article.brand_id == brand.id, Article.is_published.is_(True))
    if featured_only:
        query = query.filter(Article.is_featured.is_(True))
    if category:
        query = query.filter(Article.category.ilike(category))
    if q:
        like = f"%{q}%"
        query = query.filter(
            Article.title.ilike(like) | Article.dek.ilike(like) | Article.body_md.ilike(like)
        )
    return query.order_by(Article.published_at.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=list[ArticleCreateResult])
def create_article(payload: ArticleCreate, db: Session = Depends(get_db), scope: AdminScope = Depends(require_admin)):
    """
    Publishes one article across one or more brands at once (e.g. write it
    once, syndicate it to fyimac + fyigoogle + fyiwin + fyinetflix).
    Gated by X-Admin-Key — see auth.require_admin. Per brand, a slug already
    in use is skipped rather than erroring, so retrying a partially-failed
    request is safe.

    A scoped contributor key must be allowed on *every* requested brand or
    the whole request is rejected up front (fail closed) — no partial
    publish to the brands it does have access to.

    Always marked is_featured — anything published through this endpoint
    is hand-authored (vs. ingest_news.py's automated RSS briefs), so it
    gets the "Featured" banner on the site.
    """
    for brand_slug in payload.brand_slugs:
        scope.check_brand(brand_slug)

    slug = slugify(payload.slug or payload.title)
    if payload.author and payload.author.strip():
        author = payload.author.strip()
    else:
        author = scope.label if scope.label else DEFAULT_AUTHOR
    published_at = dt.datetime.utcnow()

    results: list[ArticleCreateResult] = []
    for brand_slug in payload.brand_slugs:
        brand = db.query(Brand).filter(Brand.slug == brand_slug).first()
        if not brand:
            results.append(ArticleCreateResult(brand_slug=brand_slug, status="brand_not_found"))
            continue

        existing = db.query(Article).filter(Article.brand_id == brand.id, Article.slug == slug).first()
        if existing:
            results.append(
                ArticleCreateResult(
                    brand_slug=brand_slug,
                    status="skipped_duplicate",
                    article_slug=slug,
                    url=f"https://{brand.domain}/{slug}",
                )
            )
            continue

        db.add(
            Article(
                brand_id=brand.id,
                slug=slug,
                category=payload.category,
                title=payload.title,
                dek=payload.dek,
                body_md=payload.body_md,
                author=author,
                published_at=published_at,
                is_published=True,
                is_featured=True,
                image_url=payload.image_url,
            )
        )
        results.append(
            ArticleCreateResult(
                brand_slug=brand_slug,
                status="created",
                article_slug=slug,
                url=f"https://{brand.domain}/{slug}",
            )
        )

    db.commit()
    return results


@router.get("/{slug}", response_model=ArticleDetail)
def get_article(
    slug: str,
    db: Session = Depends(get_db),
    brand: Brand = Depends(resolve_brand),
):
    article = (
        db.query(Article)
        .filter(Article.brand_id == brand.id, Article.slug == slug)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found for this brand")
    return article


@router.patch("/{slug}", response_model=list[ArticleCreateResult])
def update_article(
    slug: str,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
    brand_slugs: list[str] = Query(..., description="Which brands' copy of this slug to update"),
    scope: AdminScope = Depends(require_admin),
):
    """Admin-gated — edits an existing article's header image and/or body (see ArticleUpdate)."""
    for brand_slug in brand_slugs:
        scope.check_brand(brand_slug.strip().lower())

    results: list[ArticleCreateResult] = []
    for brand_slug in brand_slugs:
        brand = db.query(Brand).filter(Brand.slug == brand_slug.strip().lower()).first()
        if not brand:
            results.append(ArticleCreateResult(brand_slug=brand_slug, status="brand_not_found"))
            continue

        article = db.query(Article).filter(Article.brand_id == brand.id, Article.slug == slug).first()
        if not article:
            results.append(ArticleCreateResult(brand_slug=brand_slug, status="not_found"))
            continue

        if payload.title is not None:
            article.title = payload.title
        if payload.dek is not None:
            article.dek = payload.dek or None
        if payload.category is not None:
            article.category = payload.category or None
        if payload.author is not None:
            article.author = payload.author or None
        if payload.body_md is not None:
            article.body_md = payload.body_md
        if payload.image_url is not None:
            article.image_url = payload.image_url

        results.append(
            ArticleCreateResult(
                brand_slug=brand_slug, status="updated", article_slug=slug, url=f"https://{brand.domain}/{slug}"
            )
        )

    db.commit()
    return results


@router.delete("/{slug}")
def delete_article(
    slug: str,
    db: Session = Depends(get_db),
    brand_slugs: list[str] = Query(..., description="Which brands to remove this slug from"),
    scope: AdminScope = Depends(require_admin),
):
    """Retracts an article — e.g. to undo a typo'd publish or a duplicate syndication."""
    for brand_slug in brand_slugs:
        scope.check_brand(brand_slug.strip().lower())

    deleted = []
    for brand_slug in brand_slugs:
        brand = db.query(Brand).filter(Brand.slug == brand_slug.strip().lower()).first()
        if not brand:
            continue
        n = db.query(Article).filter(Article.brand_id == brand.id, Article.slug == slug).delete()
        if n:
            deleted.append(brand_slug)
    db.commit()
    return {"deleted_from": deleted}
