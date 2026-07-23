import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Falls back to local SQLite for quick local dev; set DATABASE_URL for Postgres
# e.g. postgresql+psycopg://user:pass@host/dbname  (Neon, RDS, etc.)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fyi.db")

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
