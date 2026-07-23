import datetime as dt
from pydantic import BaseModel, ConfigDict


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    domain: str
    accent_color: str
    tagline: str
    icon: str


class ArticleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    category: str | None
    title: str
    dek: str | None
    author: str | None
    published_at: dt.datetime


class ArticleDetail(ArticleListItem):
    body_md: str
