import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class PatientNote(Base):
    __tablename__="patient_notes"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    patient_id=Column(UUID(as_uuid=True),ForeignKey("patient_profiles.id",ondelete="CASCADE"),nullable=False,index=True)
    body=Column(String,nullable=False); created_at=Column(DateTime(timezone=True),server_default=func.now()); updated_at=Column(DateTime(timezone=True),onupdate=func.now())
class SavedNextStep(Base):
    __tablename__="saved_next_steps"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    patient_id=Column(UUID(as_uuid=True),ForeignKey("patient_profiles.id",ondelete="CASCADE"),nullable=False,index=True)
    text=Column(String,nullable=False); urgency=Column(String,nullable=False,default="routine"); completed=Column(Boolean,default=False); created_at=Column(DateTime(timezone=True),server_default=func.now())
class SpecialistContactRequest(Base):
    __tablename__="specialist_contact_requests"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    patient_id=Column(UUID(as_uuid=True),ForeignKey("patient_profiles.id",ondelete="CASCADE"),nullable=False,index=True)
    specialist_id=Column(UUID(as_uuid=True),ForeignKey("specialists.id",ondelete="SET NULL")); note=Column(String); created_at=Column(DateTime(timezone=True),server_default=func.now())
class ReferralResource(Base):
    __tablename__="referral_resources"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    title=Column(String,nullable=False); description=Column(String); url=Column(String); specialty=Column(String); active=Column(Boolean,default=True)
class PatientActivityLog(Base):
    __tablename__="patient_activity_logs"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    patient_id=Column(UUID(as_uuid=True),ForeignKey("patient_profiles.id",ondelete="CASCADE"),nullable=False,index=True)
    action=Column(String,nullable=False); metadata_json=Column(JSON,default=dict); created_at=Column(DateTime(timezone=True),server_default=func.now())
