import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class SessionStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class EntrySource(str, enum.Enum):
    NATURAL_LANGUAGE = "natural_language"
    QUICK_REPLY = "quick_reply"
    MANUAL = "manual"

class BreastAwarenessSession(Base):
    __tablename__ = "breast_awareness_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default=SessionStatus.IN_PROGRESS.value, nullable=False)
    initial_description = Column(String)
    cumulative_state = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient = relationship("PatientProfile")
    symptom_entries = relationship("BreastSymptomEntry", back_populates="session", cascade="all, delete-orphan")
    location_entries = relationship("BreastLocationEntry", back_populates="session", cascade="all, delete-orphan")
    triage_result = relationship("BreastTriageResult", back_populates="session", uselist=False, cascade="all, delete-orphan")
    summary_report = relationship("BreastSummaryReport", back_populates="session", uselist=False, cascade="all, delete-orphan")

class BreastSymptomEntry(Base):
    __tablename__ = "breast_symptom_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("breast_awareness_sessions.id", ondelete="CASCADE"), nullable=False)
    symptom_type = Column(String, nullable=False)
    value = Column(String)
    confidence = Column(Float)
    source = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("BreastAwarenessSession", back_populates="symptom_entries")

class BreastLocationEntry(Base):
    __tablename__ = "breast_location_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("breast_awareness_sessions.id", ondelete="CASCADE"), nullable=False)
    side = Column(String) # left, right, both, not sure
    region = Column(String) # upper/lower, inner/outer, etc.
    free_text_location = Column(String)
    
    session = relationship("BreastAwarenessSession", back_populates="location_entries")

class BreastTriageResult(Base):
    __tablename__ = "breast_triage_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("breast_awareness_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    triage_level = Column(String, nullable=False)
    rule_explanation = Column(String)
    recommended_action = Column(String)
    disclaimer = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("BreastAwarenessSession", back_populates="triage_result")

class BreastSummaryReport(Base):
    __tablename__ = "breast_summary_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("breast_awareness_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    structured_summary = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    session = relationship("BreastAwarenessSession", back_populates="summary_report")
