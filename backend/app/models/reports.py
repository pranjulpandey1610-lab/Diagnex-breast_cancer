import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class SavedReport(Base):
    __tablename__ = "saved_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String, nullable=False) # e.g., 'symptom_summary', 'radiology_analysis'
    title = Column(String, nullable=False)
    secure_pdf_key = Column(String)
    generated_from_session_id = Column(UUID(as_uuid=True), ForeignKey("breast_awareness_sessions.id", ondelete="SET NULL"), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    patient = relationship("PatientProfile")
    session = relationship("BreastAwarenessSession")
    versions = relationship("ReportVersion", back_populates="report", cascade="all, delete-orphan")
    access_logs = relationship("ReportAccessLog", back_populates="report", cascade="all, delete-orphan")

class ReportVersion(Base):
    __tablename__ = "report_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("saved_reports.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(String, nullable=False)
    content_snapshot_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    report = relationship("SavedReport", back_populates="versions")

class ReportAccessLog(Base):
    __tablename__ = "report_access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("saved_reports.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # e.g., 'view', 'download', 'share'
    ip_address = Column(String)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    report = relationship("SavedReport", back_populates="access_logs")
    user = relationship("Profile")
