from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.audit import AuditLog
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin)
):
    """Admins can view audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    log_audit_event(db, action="audit_logs_accessed", resource="AuditLog", user_id=current_admin.id)
    return logs
