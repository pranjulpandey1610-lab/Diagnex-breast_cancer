"""
Diagnex Backend — Audit Logging

Immutable audit trail for all data-access and state-changing operations.
Logs are append-only — no UPDATE or DELETE operations on audit records.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session


def _hash_details(details: dict[str, Any] | None) -> str:
    """
    Create a SHA-256 hash of the details dict.
    This allows auditing without storing raw PHI in logs.
    """
    if not details:
        return ""
    serialized = json.dumps(details, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


def log_event(
    db: Session,
    *,
    user_id: int | None,
    role: str | None,
    action: str,
    resource: str,
    resource_id: str | None = None,
    ip_address: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """
    Write an immutable audit log entry.

    Args:
        db: Database session
        user_id: ID of the user performing the action (None for system events)
        role: Role of the user (patient/doctor/admin/researcher)
        action: What happened (e.g., "login", "screening.submit", "file.upload")
        resource: Which resource was affected (e.g., "auth", "screening_session", "file")
        resource_id: Optional ID of the specific resource
        ip_address: Client IP address
        details: Optional dict of additional context (hashed, not stored raw)
    """
    # Import here to avoid circular imports
    from app.db.models import AuditLog

    audit_entry = AuditLog(
        user_id=user_id,
        role=role or "system",
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=ip_address,
        details_hash=_hash_details(details),
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit_entry)
    db.commit()


def log_event_no_commit(
    db: Session,
    *,
    user_id: int | None,
    role: str | None,
    action: str,
    resource: str,
    resource_id: str | None = None,
    ip_address: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """
    Write an audit log entry WITHOUT committing the transaction.
    Use this when the audit log should be part of a larger transaction.
    The caller is responsible for committing.
    """
    from app.db.models import AuditLog

    audit_entry = AuditLog(
        user_id=user_id,
        role=role or "system",
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=ip_address,
        details_hash=_hash_details(details),
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit_entry)
