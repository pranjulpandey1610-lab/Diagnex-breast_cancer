import json
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit import AuditLog

def log_audit_event(
    db: Session,
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """
    Creates an immutable audit log entry.
    Do not pass raw passwords, PHI, or sensitive tokens in the details dictionary.
    """
    ip_address = None
    if request and request.client:
        ip_address = request.client.host

    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
