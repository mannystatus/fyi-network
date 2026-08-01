import datetime as dt
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


class Brand(Base):
    """
    One row per sub-brand (fyiMac / fyiWin / fyiGoogle).
    This table is the single source of truth for brand metadata —
    the frontend fetches it instead of hardcoding domain/color/tagline.
    """
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True)
    slug = Column(String(32), unique=True, nullable=False)       # "fyimac"
    name = Column(String(64), nullable=False)                    # "fyiMac"
    domain = Column(String(128), unique=True, nullable=False)    # "fyimac.com"
    accent_color = Column(String(16), nullable=False)            # "#e8e8ed"
    tagline = Column(String(256), nullable=False)
    icon = Column(String(32), nullable=False)                    # "mac" | "win" | "google"
    topics = Column(String(512), nullable=False, default="")     # comma-separated, e.g. "Mac,iPhone,iPad"
    image_url = Column(String(1024), nullable=True)              # site header banner, set from /admin

    articles = relationship("Article", back_populates="brand")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    slug = Column(String(256), nullable=False, index=True)
    category = Column(String(64))
    title = Column(String(256), nullable=False)
    dek = Column(String(512))               # short summary/subhead
    body_md = Column(Text, nullable=False)  # markdown body
    author = Column(String(128))
    published_at = Column(DateTime, default=dt.datetime.utcnow)
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    image_url = Column(String(1024), nullable=True)  # header image shown atop the article

    brand = relationship("Brand", back_populates="articles")


class AdminAuthFailure(Base):
    """
    One row per failed X-Admin-Key attempt, keyed by client IP. Backs the
    rate limiter in auth.py — a DB table (not an in-memory counter) because
    this runs as stateless serverless functions, where in-memory state
    doesn't survive between invocations or across instances.
    """
    __tablename__ = "admin_auth_failures"

    id = Column(Integer, primary_key=True)
    ip = Column(String(64), nullable=False, index=True)
    occurred_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)


class AdminKey(Base):
    """
    A brand-scoped contributor key — issued from /admin by whoever holds
    the superadmin ADMIN_API_KEY env var, to let other people publish to
    specific sites (e.g. fyilakers.com + fyidodgers.com) without handing
    out the one shared secret that controls the whole network. See
    auth.py's require_admin, which checks this table for anything that
    isn't an exact match on ADMIN_API_KEY.

    Only the hash is stored — the raw key is shown exactly once, at
    creation time, same as any other API-key-style credential.
    """
    __tablename__ = "admin_keys"

    id = Column(Integer, primary_key=True)
    label = Column(String(128), nullable=False)              # "Lakers writer" — shown in the admin UI, defaults the Author field
    key_hash = Column(String(64), nullable=False, unique=True, index=True)
    key_prefix = Column(String(8), nullable=False)            # first chars of the raw key, so the list is distinguishable without re-exposing secrets
    brand_slugs = Column(String(512), nullable=False)         # comma-separated, same convention as Brand.topics — always non-empty; unlike Brand.topics, empty here would mean "no access", never "full access"
    is_revoked = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)


class TipSubmission(Base):
    """
    One row per accepted tip-form submission, keyed by client IP. Backs the
    rate limiter in routers/tip.py — same DB-backed pattern as
    AdminAuthFailure, for the same stateless-serverless reason.
    """
    __tablename__ = "tip_submissions"

    id = Column(Integer, primary_key=True)
    ip = Column(String(64), nullable=False, index=True)
    occurred_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)


class PushSubscription(Base):
    """
    A browser's Web Push subscription for game-day alerts (fyiDodgers,
    fyiLakers). One backend serves every brand, so — unlike hackthedeal.com's
    single-brand equivalent this mirrors — each row is scoped to the brand
    that captured it; app/send_game_alerts.py only ever pushes to
    subscriptions matching the brand whose game triggered the alert.
    """
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True)
    brand_slug = Column(String(32), nullable=False, index=True)
    endpoint = Column(Text, nullable=False, unique=True)
    p256dh = Column(String(255), nullable=False)
    auth = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)


class SentGameAlert(Base):
    """
    Dedup record for game-day push alerts — app/send_game_alerts.py runs on
    a schedule (every ~15 min, see .github/workflows/game-alerts.yml) and
    needs to know it already sent "starting soon" or "final" for a given
    game so it doesn't re-notify every subscriber on every run.
    """
    __tablename__ = "sent_game_alerts"

    id = Column(Integer, primary_key=True)
    brand_slug = Column(String(32), nullable=False)
    game_id = Column(String(64), nullable=False)
    alert_type = Column(String(16), nullable=False)  # "starting_soon" | "final"
    sent_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("brand_slug", "game_id", "alert_type", name="uq_sent_game_alert"),
    )
