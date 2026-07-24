import datetime as dt
from pydantic import BaseModel, ConfigDict, field_validator


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    domain: str
    accent_color: str
    tagline: str
    icon: str
    topics: list[str]

    @field_validator("topics", mode="before")
    @classmethod
    def split_topics(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v


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
