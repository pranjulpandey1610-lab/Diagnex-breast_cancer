from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.profile import Profile, PatientProfile
from app.schemas.profile import PatientProfileResponse, PatientProfileUpdate
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/me/patient", response_model=PatientProfileResponse)
def get_my_patient_profile(
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.require_role(["patient"]))
):
    """Retrieve the current patient's profile."""
    if not current_user.patient_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return current_user.patient_profile

@router.put("/me/patient", response_model=PatientProfileResponse)
def update_my_patient_profile(
    profile_in: PatientProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.require_role(["patient"]))
):
    """Update the current patient's profile."""
    profile = current_user.patient_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    log_audit_event(db, action="profile_updated", resource="PatientProfile", resource_id=str(profile.id), user_id=current_user.id)
    return profile

