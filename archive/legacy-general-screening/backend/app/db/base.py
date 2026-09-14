"""
Diagnex Backend — Database Engine & Session

Configures SQLAlchemy engine, session factory, and declarative Base.
Supports both PostgreSQL (production) and SQLite (dev/testing).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""
    pass


def _build_engine():
    settings = get_settings()
    url = settings.DATABASE_URL

    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    return create_engine(
        url,
        connect_args=connect_args,
        echo=settings.DEBUG,
        pool_pre_ping=True,
    )


engine = _build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    FastAPI dependency that yields a database session.
    Ensures the session is closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
