from pydantic import BaseModel, UUID4, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class EmergencyContactBase(BaseModel):
    name: str
    relationship: Optional[str] = None
    phone: str
    email: Optional[str] = None

class EmergencyContactResponse(EmergencyContactBase):
    id: UUID4
    patient_id: UUID4

    model_config = ConfigDict(from_attributes=True)

class PatientPreferenceBase(BaseModel):
    communication_channel: str = "email"
    receive_marketing: bool = False

class PatientPreferenceResponse(PatientPreferenceBase):
    id: UUID4
    patient_id: UUID4

    model_config = ConfigDict(from_attributes=True)

class PatientProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    optional_phone: Optional[str] = None

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfileResponse(PatientProfileBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PatientProfileUpdate(PatientProfileBase):
    pass
