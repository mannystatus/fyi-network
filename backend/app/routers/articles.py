from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Article, Brand
from ..schemas import ArticleListItem, ArticleDetail
from ..deps import resolve_brand

router = APIRouter(prefix="/api/articles", tags=["articles"])


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
