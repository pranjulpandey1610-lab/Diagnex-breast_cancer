import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class UploadStatus(str, enum.Enum):
    PENDING = "pending"
    SCANNING = "scanning"
    CLEAN = "clean"
    QUARANTINED = "quarantined"
    PROCESSED = "processed"

class DocumentExtractionStatus(str, enum.Enum):
    PENDING = "pending"
    EXTRACTING = "extracting"
    COMPLETED = "completed"
    FAILED = "failed"

class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String, nullable=False)
    secure_storage_key = Column(String, unique=True, nullable=False)
    content_type = Column(String)
    file_size = Column(Integer)
    sha256_hash = Column(String)
    upload_status = Column(Enum(UploadStatus), default=UploadStatus.PENDING)
    malware_scan_status = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("PatientProfile")
    document = relationship("UploadedDocument", back_populates="upload", uselist=False, cascade="all, delete-orphan")
    access_logs = relationship("FileAccessLog", back_populates="upload", cascade="all, delete-orphan")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id", ondelete="CASCADE"), unique=True, nullable=False)
    document_type = Column(String) # e.g., 'mammogram_report', 'biopsy_report'
    extraction_status = Column(Enum(DocumentExtractionStatus), default=DocumentExtractionStatus.PENDING)
    report_date = Column(DateTime(timezone=True))
    source_facility = Column(String)
    patient_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    upload = relationship("Upload", back_populates="document")
    extractions = relationship("DocumentExtraction", back_populates="document", cascade="all, delete-orphan")

class DocumentExtraction(Base):
    __tablename__ = "document_extractions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False)
    extracted_text = Column(String)
    extraction_engine = Column(String)
    extraction_confidence = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    document = relationship("UploadedDocument", back_populates="extractions")
    clinical_values = relationship("ExtractedClinicalValue", back_populates="extraction", cascade="all, delete-orphan")

class ExtractedClinicalValue(Base):
    __tablename__ = "extracted_clinical_values"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    extraction_id = Column(UUID(as_uuid=True), ForeignKey("document_extractions.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String, nullable=False)
    field_value = Column(String)
    unit = Column(String)
    source_page = Column(Integer)
    user_confirmed = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    extraction = relationship("DocumentExtraction", back_populates="clinical_values")

class FileAccessLog(Base):
    __tablename__ = "file_access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # e.g., 'download', 'view'
    ip_address = Column(String)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    upload = relationship("Upload", back_populates="access_logs")
    user = relationship("Profile")
