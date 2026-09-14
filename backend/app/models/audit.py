import uuid
from sqlalchemy import Column, DateTime, String, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="SET NULL"), index=True, nullable=True) # Nullable for unauthenticated actions
    action = Column(String, nullable=False, index=True)
    resource = Column(String, nullable=False)
    resource_id = Column(String)
    details = Column(JSON) # Store non-sensitive metadata only
    ip_address = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
