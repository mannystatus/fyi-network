import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Article, Brand
from ..schemas import ArticleListItem, ArticleDetail, ArticleCreate, ArticleCreateResult
from ..deps import resolve_brand
from ..auth import require_admin
from ..slugs import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])

DEFAULT_AUTHOR = "Manny Contreras"


@router.get("", response_model=list[ArticleListItem])
def list_articles(
    db: Session = Depends(get_db),
    brand: Brand = Depends(resolve_brand),
    category: str | None = Query(default=None, description="Filter to one topic/category, e.g. ?category=Mac"),
    limit: int = 20,
):
    query = db.query(Article).filter(Article.brand_id == brand.id, Article.is_published.is_(True))
    if category:
        query = query.filter(Article.category.ilike(category))
    return query.order_by(Article.published_at.desc()).limit(limit).all()


@router.post("", response_model=list[ArticleCreateResult], dependencies=[Depends(require_admin)])
def create_article(payload: ArticleCreate, db: Session = Depends(get_db)):
    """
    Publishes one article across one or more brands at once (e.g. write it
    once, syndicate it to fyimac + fyigoogle + fyiwin + fyinetflix).
    Gated by X-Admin-Key — see auth.require_admin. Per brand, a slug already
    in use is skipped rather than erroring, so retrying a partially-failed
    request is safe.
    """
    slug = slugify(payload.slug or payload.title)
    author = payload.author.strip() if payload.author and payload.author.strip() else DEFAULT_AUTHOR
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
