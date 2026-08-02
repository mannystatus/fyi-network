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
    image_url: str | None = None

    @field_validator("topics", mode="before")
    @classmethod
    def split_topics(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v


class BrandUpdate(BaseModel):
    image_url: str | None = None


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
    image_url: str | None = None


class ArticleCreate(BaseModel):
    title: str
    body_md: str
    dek: str | None = None
    category: str | None = None
    author: str | None = None
    slug: str | None = None
    image_url: str | None = None
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


class AdminScopeOut(BaseModel):
    """Response for GET /api/admin/whoami — what the caller's own key can do."""

    is_superadmin: bool
    brand_slugs: list[str]
    label: str | None = None


class AdminAccessLogOut(BaseModel):
    """Response row for GET /api/admin/access-log — one /admin login/visit."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    ip: str
    city: str | None = None
    region: str | None = None
    country: str | None = None
    is_superadmin: bool
    key_label: str | None = None
    occurred_at: dt.datetime


class AdminKeyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    key_prefix: str
    brand_slugs: list[str]
    is_revoked: bool
    created_at: dt.datetime

    @field_validator("brand_slugs", mode="before")
    @classmethod
    def split_brand_slugs(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v


class AdminKeyCreate(BaseModel):
    label: str
    brand_slugs: list[str]

    @field_validator("label")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v.strip()

    @field_validator("brand_slugs")
    @classmethod
    def normalize_brand_slugs(cls, v: list[str]) -> list[str]:
        cleaned = [s.strip().lower() for s in v if s.strip()]
        if not cleaned:
            raise ValueError("at least one brand_slug is required")
        return cleaned


class AdminKeyCreateResult(AdminKeyOut):
    key: str  # the raw secret — only ever present in this one response


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


class TravelAdvisoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source: str
    country: str
    level: str
    severity: int
    scope: str
    url: str
    advisory_updated_at: dt.datetime | None = None


class VisaPassportOut(BaseModel):
    code: str
    name: str


class VisaRequirementOut(BaseModel):
    country: str  # matches TravelAdvisory.country, not necessarily the dataset's own destination_name
    requirement: str


class PushSubscribeIn(BaseModel):
    endpoint: str
    keys: dict[str, str]


class PushUnsubscribeIn(BaseModel):
    endpoint: str


class PublicKeyOut(BaseModel):
    publicKey: str
