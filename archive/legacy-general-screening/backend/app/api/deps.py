"""
Diagnex Backend — API Dependencies

FastAPI dependency injection for authentication and role-based access control.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.base import get_db
from app.db.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT access token and return the authenticated user.
    Raises 401 if the token is invalid, expired, or the user doesn't exist.
    """
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Access token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Alias for get_current_user that also checks is_active (already checked above)."""
    return current_user


# ── Role-Based Access Control Dependencies ───────────────────

def require_role(*allowed_roles: UserRole):
    """
    Factory that returns a FastAPI dependency requiring the user
    to have one of the specified roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """

    def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(r.value for r in allowed_roles)}",
            )
        return current_user

    return role_checker


# Convenience dependencies for common role checks
require_admin = require_role(UserRole.ADMIN)
require_doctor = require_role(UserRole.DOCTOR)
require_patient = require_role(UserRole.PATIENT)
require_researcher = require_role(UserRole.RESEARCHER)
require_doctor_or_admin = require_role(UserRole.DOCTOR, UserRole.ADMIN)
require_admin_or_researcher = require_role(UserRole.ADMIN, UserRole.RESEARCHER)
