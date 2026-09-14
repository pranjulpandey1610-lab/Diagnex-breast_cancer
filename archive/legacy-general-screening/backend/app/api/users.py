"""
Diagnex Backend — Users Router

Admin endpoints for user management (list, role changes, activate/deactivate).
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.api.schemas import UserActiveUpdate, UserResponse, UserRoleUpdate
from app.core.audit import log_event
from app.db.base import get_db
from app.db.models import User, UserRole

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get(
    "/",
    response_model=list[UserResponse],
    dependencies=[Depends(require_role(UserRole.ADMIN))],
    summary="List all users (admin only)",
)
def list_users(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List all registered users. Admin-only."""
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role.value,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
    summary="Change a user's role (admin only)",
)
def update_role(
    user_id: int,
    data: UserRoleUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change a user's role. Admin-only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role.")

    old_role = user.role.value
    user.role = UserRole(data.role)
    db.commit()
    db.refresh(user)

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="user.role_change",
        resource="user",
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
        details={"old_role": old_role, "new_role": data.role},
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.patch(
    "/{user_id}/active",
    response_model=UserResponse,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
    summary="Activate or deactivate a user (admin only)",
)
def update_active_status(
    user_id: int,
    data: UserActiveUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user account. Admin-only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account.")

    user.is_active = data.is_active
    db.commit()
    db.refresh(user)

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="user.active_change",
        resource="user",
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
        details={"is_active": data.is_active},
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
    )
