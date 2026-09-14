import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class ContactType(str, enum.Enum):
    PHONE = "phone"
    EMAIL = "email"
    WEBSITE = "website"

class Specialist(Base):
    __tablename__ = "specialists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    clinic_name = Column(String)
    description = Column(String)
    verification_status = Column(String, default="unverified")
    last_updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    locations = relationship("SpecialistLocation", back_populates="specialist", cascade="all, delete-orphan")
    contact_methods = relationship("SpecialistContactMethod", back_populates="specialist", cascade="all, delete-orphan")

class SpecialistLocation(Base):
    __tablename__ = "specialist_locations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    specialist_id = Column(UUID(as_uuid=True), ForeignKey("specialists.id", ondelete="CASCADE"), nullable=False)
    office_address = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    maps_url = Column(String)
    
    specialist = relationship("Specialist", back_populates="locations")

class SpecialistContactMethod(Base):
    __tablename__ = "specialist_contact_methods"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    specialist_id = Column(UUID(as_uuid=True), ForeignKey("specialists.id", ondelete="CASCADE"), nullable=False)
    contact_type = Column(Enum(ContactType), nullable=False)
    contact_value = Column(String, nullable=False)
    is_public = Column(Boolean, default=True)
    
    specialist = relationship("Specialist", back_populates="contact_methods")
