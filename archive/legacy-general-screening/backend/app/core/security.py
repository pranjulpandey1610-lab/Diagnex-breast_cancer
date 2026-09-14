"""
Diagnex Backend — Security Utilities

Handles JWT token creation/verification, password hashing,
and file-at-rest encryption using Fernet (AES-128-CBC).
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt

from app.core.config import get_settings

# ── Password Hashing ────────────────────────────────────────


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT Tokens ───────────────────────────────────────────────

def create_access_token(data: dict[str, Any]) -> str:
    """Create a short-lived JWT access token."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create a long-lived JWT refresh token."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT token.
    Returns the payload dict or None if invalid/expired.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ── File Encryption (Fernet / AES) ──────────────────────────

_fernet_instance: Fernet | None = None


def _get_fernet() -> Fernet:
    """Get a cached Fernet instance using the configured encryption key."""
    global _fernet_instance
    if _fernet_instance is not None:
        return _fernet_instance

    settings = get_settings()
    key = settings.ENCRYPTION_KEY
    if not key or key == "":
        # Generate a key for development; in production this MUST be set
        key = Fernet.generate_key().decode()
    _fernet_instance = Fernet(key.encode() if isinstance(key, str) else key)
    return _fernet_instance


def encrypt_data(data: bytes) -> bytes:
    """Encrypt arbitrary bytes using Fernet (AES-128-CBC with HMAC)."""
    return _get_fernet().encrypt(data)


def decrypt_data(encrypted_data: bytes) -> bytes | None:
    """
    Decrypt Fernet-encrypted bytes.
    Returns None if the token is invalid or tampered with.
    """
    try:
        return _get_fernet().decrypt(encrypted_data)
    except InvalidToken:
        return None


def encrypt_string(text: str) -> str:
    """Encrypt a string and return the base64-encoded ciphertext."""
    return encrypt_data(text.encode("utf-8")).decode("utf-8")


def decrypt_string(encrypted_text: str) -> str | None:
    """Decrypt a base64-encoded Fernet ciphertext back to a string."""
    result = decrypt_data(encrypted_text.encode("utf-8"))
    return result.decode("utf-8") if result else None
