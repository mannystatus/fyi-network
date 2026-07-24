import datetime as dt
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
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

    brand = relationship("Brand", back_populates="articles")
