"""
Diagnex Backend — Admin Router

Admin-only endpoints for audit logs, system stats, and model registry.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.api.schemas import (
    AuditLogResponse,
    ModelRegistryCreate,
    ModelRegistryResponse,
    SystemStatsResponse,
)
from app.core.audit import log_event
from app.db.base import get_db
from app.db.models import (
    AuditLog,
    FileUpload,
    ModelRegistry,
    ScreeningResult,
    ScreeningSession,
    User,
    UserRole,
)

router = APIRouter(prefix="/api/admin", tags=["Administration"])


@router.get(
    "/audit-logs",
    response_model=list[AuditLogResponse],
    dependencies=[Depends(require_role(UserRole.ADMIN))],
    summary="Query audit logs",
)
def list_audit_logs(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    action: str | None = None,
    user_id: int | None = None,
):
    """
    Query the immutable audit log. Admin-only.
    Supports filtering by action type and user ID.
    """
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = (
        query.order_by(AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            role=log.role,
            action=log.action,
            resource=log.resource,
            resource_id=log.resource_id,
            ip_address=log.ip_address,
            timestamp=log.timestamp,
        )
        for log in logs
    ]


@router.get(
    "/stats",
    response_model=SystemStatsResponse,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
    summary="Get system statistics",
)
def get_stats(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregate system statistics. Admin-only."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_screenings = db.query(func.count(ScreeningSession.id)).scalar() or 0
    pending_reviews = (
        db.query(func.count(ScreeningResult.id))
        .filter(ScreeningResult.clinician_reviewed == False)
        .scalar()
        or 0
    )
    total_uploads = db.query(func.count(FileUpload.id)).scalar() or 0

    # Screenings by type
    type_counts = (
        db.query(ScreeningSession.screening_type, func.count(ScreeningSession.id))
        .group_by(ScreeningSession.screening_type)
        .all()
    )
    screenings_by_type = {str(t.value if hasattr(t, "value") else t): c for t, c in type_counts}

    # Users by role
    role_counts = (
        db.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )
    users_by_role = {str(r.value if hasattr(r, "value") else r): c for r, c in role_counts}

    return SystemStatsResponse(
        total_users=total_users,
        active_users=active_users,
        total_screenings=total_screenings,
        pending_reviews=pending_reviews,
        total_uploads=total_uploads,
        screenings_by_type=screenings_by_type,
        users_by_role=users_by_role,
    )


@router.get(
    "/models",
    response_model=list[ModelRegistryResponse],
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.RESEARCHER))],
    summary="List registered models",
)
def list_models(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all registered ML models. Admin and researcher access."""
    models = db.query(ModelRegistry).order_by(ModelRegistry.created_at.desc()).all()
    return [
        ModelRegistryResponse(
            id=m.id,
            name=m.name,
            version=m.version,
            dataset_version=m.dataset_version,
            description=m.description,
            metrics_json=m.metrics_json,
            is_active=m.is_active,
            created_at=m.created_at,
        )
        for m in models
    ]


@router.post(
    "/models",
    response_model=ModelRegistryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.RESEARCHER))],
    summary="Register a new model version",
)
def register_model(
    data: ModelRegistryCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register a new model version in the registry. Admin and researcher access."""
    model = ModelRegistry(
        name=data.name,
        version=data.version,
        dataset_version=data.dataset_version,
        description=data.description,
        metrics_json=data.metrics_json,
        file_path=data.file_path,
        is_active=True,
    )
    db.add(model)
    db.commit()
    db.refresh(model)

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="model.register",
        resource="model_registry",
        resource_id=str(model.id),
        ip_address=request.client.host if request.client else None,
        details={"model_name": data.name, "version": data.version},
    )

    return ModelRegistryResponse(
        id=model.id,
        name=model.name,
        version=model.version,
        dataset_version=model.dataset_version,
        description=model.description,
        metrics_json=model.metrics_json,
        is_active=model.is_active,
        created_at=model.created_at,
    )
