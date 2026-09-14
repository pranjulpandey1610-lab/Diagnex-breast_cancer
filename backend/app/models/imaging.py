import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class ArchiveStatus(str, enum.Enum):
    PENDING = "pending"
    ARCHIVED = "archived"
    FAILED = "failed"

class ImagingStudy(Base):
    __tablename__ = "imaging_studies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id", ondelete="SET NULL"), nullable=True)
    modality = Column(String) # e.g., MG (Mammography), US (Ultrasound), MR (MRI)
    study_date = Column(DateTime(timezone=True))
    orthanc_study_id = Column(String, unique=True, index=True) # ID in external PACS
    archive_status = Column(Enum(ArchiveStatus), default=ArchiveStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("PatientProfile")
    upload = relationship("Upload")
    series = relationship("ImagingSeries", back_populates="study", cascade="all, delete-orphan")
    radiology_report = relationship("RadiologyReport", back_populates="study", uselist=False, cascade="all, delete-orphan")
    access_logs = relationship("ImagingAccessLog", back_populates="study", cascade="all, delete-orphan")

class ImagingSeries(Base):
    __tablename__ = "imaging_series"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("imaging_studies.id", ondelete="CASCADE"), nullable=False)
    orthanc_series_id = Column(String, unique=True, index=True)
    series_description = Column(String)
    body_part = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    study = relationship("ImagingStudy", back_populates="series")
    instances = relationship("ImagingInstance", back_populates="series", cascade="all, delete-orphan")

class ImagingInstance(Base):
    __tablename__ = "imaging_instances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    series_id = Column(UUID(as_uuid=True), ForeignKey("imaging_series.id", ondelete="CASCADE"), nullable=False)
    orthanc_instance_id = Column(String, unique=True, index=True)
    sop_instance_uid = Column(String, unique=True)
    encrypted_storage_key = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    series = relationship("ImagingSeries", back_populates="instances")

class RadiologyReport(Base):
    __tablename__ = "radiology_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("imaging_studies.id", ondelete="CASCADE"), unique=True, nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="SET NULL"), nullable=True)
    birads_category = Column(String)
    findings_summary = Column(String)
    recommendation = Column(String)
    source_page = Column(Integer)
    patient_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    study = relationship("ImagingStudy", back_populates="radiology_report")
    document = relationship("UploadedDocument")

class ImagingAccessLog(Base):
    __tablename__ = "imaging_access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("imaging_studies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # e.g., 'view_viewer', 'download_dicom'
    ip_address = Column(String)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    study = relationship("ImagingStudy", back_populates="access_logs")
    user = relationship("Profile")
