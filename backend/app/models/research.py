import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class ResearchDataset(Base):
    __tablename__ = "research_datasets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    dataset_id = Column(String, unique=True, index=True)
    source_url = Column(String)
    license = Column(String)
    intended_use = Column(String)
    source_institution = Column(String)
    dataset_version = Column(String)
    date_obtained = Column(String)
    patient_count = Column(Integer)
    record_count = Column(Integer)
    features = Column(JSON)
    label_definition = Column(String)
    class_balance = Column(JSON)
    missing_values = Column(JSON)
    preprocessing_status = Column(String, default="not_started")
    deidentification_status = Column(String, default="unverified")
    limitations = Column(String)
    approval_status = Column(String, default="pending")
    research_only = Column(Integer, default=1, nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    creator = relationship("Profile")
    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("research_datasets.id", ondelete="CASCADE"), nullable=False)
    version_tag = Column(String, nullable=False)
    record_count = Column(Integer)
    storage_key = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    dataset = relationship("ResearchDataset", back_populates="versions")
    validation_runs = relationship("DatasetValidationRun", back_populates="dataset_version", cascade="all, delete-orphan")

class DatasetValidationRun(Base):
    __tablename__ = "dataset_validation_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_version_id = Column(UUID(as_uuid=True), ForeignKey("dataset_versions.id", ondelete="CASCADE"), nullable=False)
    validation_status = Column(String)
    issues_found = Column(JSON)
    quality_report = Column(JSON)
    manifest_path = Column(String)
    run_at = Column(DateTime(timezone=True), server_default=func.now())
    
    dataset_version = relationship("DatasetVersion", back_populates="validation_runs")

class MLExperiment(Base):
    __tablename__ = "ml_experiments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    dataset_version_id = Column(UUID(as_uuid=True), ForeignKey("dataset_versions.id", ondelete="SET NULL"), nullable=True)
    hyperparameters = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    dataset_version = relationship("DatasetVersion")
    models = relationship("MLModel", back_populates="experiment", cascade="all, delete-orphan")

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("ml_experiments.id", ondelete="CASCADE"), nullable=False)
    model_name = Column(String, nullable=False)
    model_type = Column(String)
    model_storage_key = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    experiment = relationship("MLExperiment", back_populates="models")
    metrics = relationship("ModelMetric", back_populates="model", cascade="all, delete-orphan")
    cards = relationship("ModelCard", back_populates="model", cascade="all, delete-orphan")

class ModelMetric(Base):
    __tablename__ = "model_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    model = relationship("MLModel", back_populates="metrics")

class ModelCard(Base):
    __tablename__ = "model_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id", ondelete="CASCADE"), unique=True, nullable=False)
    intended_use = Column(String)
    limitations = Column(String)
    ethical_considerations = Column(String)
    training_data_summary = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    model = relationship("MLModel", back_populates="cards")
