"""
Diagnex Backend — Auth Router

Handles user registration, login, token refresh, and logout.
All auth events are audit-logged.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.schemas import (
    TokenRefresh,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.core.audit import log_event
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.base import get_db
from app.db.models import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    data: UserRegister,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Create a new user account. Default role is 'patient'.
    Returns the created user profile (no password hash).
    """
    # Check for existing user
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.PATIENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    log_event(
        db,
        user_id=user.id,
        role=user.role.value,
        action="auth.register",
        resource="user",
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
    )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT tokens",
)
def login(
    data: UserLogin,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password.
    Returns short-lived access token and long-lived refresh token.
    """
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        # Audit failed login attempt (no user_id if user not found)
        log_event(
            db,
            user_id=user.id if user else None,
            role=user.role.value if user else None,
            action="auth.login_failed",
            resource="auth",
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact an administrator.",
        )

    # Create tokens
    token_data = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Audit successful login
    log_event(
        db,
        user_id=user.id,
        role=user.role.value,
        action="auth.login",
        resource="auth",
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an expired access token",
)
def refresh_token(
    data: TokenRefresh,
    request: Request,
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated.",
        )

    token_data = {"sub": str(user.id), "role": user.role.value}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    log_event(
        db,
        user_id=user.id,
        role=user.role.value,
        action="auth.token_refresh",
        resource="auth",
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's profile."""
    return current_user
