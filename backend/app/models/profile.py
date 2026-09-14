import uuid
from sqlalchemy import Boolean, Column, Date, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship as db_relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class Profile(Base):
    __tablename__ = "profiles"

    # In Supabase, this ID should match auth.users.id
    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    role = Column(String, nullable=False, default="patient")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))

    patient_profile = db_relationship("PatientProfile", back_populates="profile", uselist=False, cascade="all, delete-orphan")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(Date)
    sex = Column(String)
    city = Column(String)
    country = Column(String)
    optional_phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    profile = db_relationship("Profile", back_populates="patient_profile")
    preferences = db_relationship("PatientPreference", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    emergency_contacts = db_relationship("EmergencyContact", back_populates="patient", cascade="all, delete-orphan")
    consent_records = db_relationship("ConsentRecord", back_populates="patient", cascade="all, delete-orphan")
    # we will add relationships to sessions, uploads, etc. in their respective files or let them back-populate

class PatientPreference(Base):
    __tablename__ = "patient_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    communication_channel = Column(String, default="email")
    receive_marketing = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient = db_relationship("PatientProfile", back_populates="preferences")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    relationship = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient = db_relationship("PatientProfile", back_populates="emergency_contacts")

class ConsentRecord(Base):
    __tablename__ = "consent_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String, nullable=False) # e.g., 'data_storage', 'research_participation'
    granted = Column(Boolean, nullable=False, default=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String)
    
    patient = db_relationship("PatientProfile", back_populates="consent_records")
