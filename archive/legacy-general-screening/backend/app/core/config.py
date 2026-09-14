"""
Diagnex Backend — Core Configuration

Loads settings from environment variables with sensible defaults.
Uses Pydantic Settings for validation and type coercion.
"""

from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "Diagnex"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./diagnex.db"

    # ── JWT Auth ─────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_TO_A_RANDOM_64_CHAR_HEX_STRING"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Encryption ───────────────────────────────────────────
    ENCRYPTION_KEY: str = ""

    # ── File Storage ─────────────────────────────────────────
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # ── CORS ─────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Admin Seed ───────────────────────────────────────────
    ADMIN_EMAIL: str = "admin@diagnex.local"
    ADMIN_PASSWORD: str = "CHANGE_ME_ADMIN_PASSWORD"

    @property
    def upload_path(self) -> Path:
        path = Path(self.UPLOAD_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Cached singleton accessor for application settings."""
    return Settings()
