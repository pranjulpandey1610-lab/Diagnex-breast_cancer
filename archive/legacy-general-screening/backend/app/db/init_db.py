"""
Diagnex Backend — Database Initialization

Creates all tables and seeds the admin user and initial model registry.
"""

import logging

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base, engine, SessionLocal
from app.db.models import User, UserRole, ModelRegistry

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Create all tables and seed initial data."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created.")

    db = SessionLocal()
    try:
        _seed_admin(db)
        _seed_models(db)
    finally:
        db.close()


def _seed_admin(db: Session) -> None:
    """Create the initial admin user if it doesn't exist."""
    settings = get_settings()
    existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if existing:
        logger.info("Admin user already exists, skipping seed.")
        return

    admin = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        full_name="System Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    logger.info(f"Admin user created: {settings.ADMIN_EMAIL}")


def _seed_models(db: Session) -> None:
    """Register initial ML models if none exist."""
    existing = db.query(ModelRegistry).first()
    if existing:
        logger.info("Model registry already populated, skipping seed.")
        return

    models = [
        ModelRegistry(
            name="diabetes_rf",
            version="1.0.0",
            dataset_version="pima_indians_v1",
            description="Random Forest classifier for diabetes risk screening (Pima Indians dataset)",
            metrics_json='{"accuracy": 0.0, "recall": 0.0, "precision": 0.0, "f1": 0.0}',
            file_path="app/ml/models/diabetes_rf_v1.joblib",
            is_active=True,
        ),
        ModelRegistry(
            name="breast_cancer_rf",
            version="1.0.0",
            dataset_version="wisconsin_v1",
            description="Random Forest classifier for breast cancer risk screening (Wisconsin dataset)",
            metrics_json='{"accuracy": 0.0, "recall": 0.0, "precision": 0.0, "f1": 0.0}',
            file_path="app/ml/models/breast_cancer_rf_v1.joblib",
            is_active=True,
        ),
    ]
    db.add_all(models)
    db.commit()
    logger.info("Initial model registry seeded.")
