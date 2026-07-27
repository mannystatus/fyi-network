import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()  # reads backend/.env (DATABASE_URL, ADMIN_API_KEY, ...) into os.environ

# Falls back to local SQLite for quick local dev; set DATABASE_URL for Postgres
# e.g. postgresql+psycopg://user:pass@host/dbname  (Neon, RDS, etc.)
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./fyi.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# There's no Alembic here — `Base.metadata.create_all()` only creates tables
# that don't exist yet, it never adds a column to a table that's already
# there. New nullable-with-default columns (like Article.is_featured) need
# this instead, run right after create_all in every entrypoint (main.py,
# seed.py, ingest_news.py) so it self-heals on next startup/run in every
# environment — local SQLite and the deployed Postgres alike — without a
# separate manual migration step.
def ensure_schema(bind) -> None:
    inspector = inspect(bind)
    table_names = inspector.get_table_names()

    with bind.begin() as conn:
        if "articles" in table_names:
            existing = {c["name"] for c in inspector.get_columns("articles")}
            if "is_featured" not in existing:
                conn.execute(text("ALTER TABLE articles ADD COLUMN is_featured BOOLEAN DEFAULT FALSE NOT NULL"))
            if "image_url" not in existing:
                conn.execute(text("ALTER TABLE articles ADD COLUMN image_url VARCHAR(1024)"))

        if "brands" in table_names:
            existing = {c["name"] for c in inspector.get_columns("brands")}
            if "image_url" not in existing:
                conn.execute(text("ALTER TABLE brands ADD COLUMN image_url VARCHAR(1024)"))
