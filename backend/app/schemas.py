import datetime as dt
from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    is_featured: bool


class ArticleDetail(ArticleListItem):
    body_md: str


class ArticleCreate(BaseModel):
    title: str
    body_md: str
    dek: str | None = None
    category: str | None = None
    author: str | None = None
    slug: str | None = None
    brand_slugs: list[str]

    @field_validator("title", "body_md")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v

    @field_validator("brand_slugs")
    @classmethod
    def normalize_brand_slugs(cls, v: list[str]) -> list[str]:
        cleaned = [s.strip().lower() for s in v if s.strip()]
        if not cleaned:
            raise ValueError("at least one brand_slug is required")
        return cleaned


class ArticleCreateResult(BaseModel):
    brand_slug: str
    status: str  # "created" | "skipped_duplicate" | "brand_not_found"
    article_slug: str | None = None
    url: str | None = None


class TipChallenge(BaseModel):
    a: int
    b: int
    sig: str


class TipCreate(BaseModel):
    a: int
    b: int
    sig: str
    answer: int
    message: str = Field(max_length=5000)
    email: str | None = None
    honeypot: str | None = None  # must arrive empty — bots tend to fill every field
    elapsed_ms: int
    source: str

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v
