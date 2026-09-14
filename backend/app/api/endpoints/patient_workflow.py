from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api import deps
from app.models.patient_workflow import PatientNote, SavedNextStep, PatientActivityLog
from app.core.audit import log_audit_event

router=APIRouter()
class NoteIn(BaseModel): body:str
class StepIn(BaseModel): text:str; urgency:str="routine"
def patient(user=Depends(deps.require_role(["patient"]))):
    if not user.patient_profile: raise HTTPException(403,"Patient profile required")
    return user
def audit(db,user,action,resource_id=None):
    db.add(PatientActivityLog(patient_id=user.patient_profile.id,action=action));db.commit();log_audit_event(db,action,"PatientWorkflow",resource_id,user.id)
@router.get("/notes")
def notes(db:Session=Depends(deps.get_db),user=Depends(patient)):
    return db.query(PatientNote).filter_by(patient_id=user.patient_profile.id).all()
@router.post("/notes")
def add_note(payload:NoteIn,db:Session=Depends(deps.get_db),user=Depends(patient)):
    row=PatientNote(patient_id=user.patient_profile.id,body=payload.body);db.add(row);db.commit();audit(db,user,"patient_note_saved",str(row.id));return row
@router.get("/next-steps")
def steps(db:Session=Depends(deps.get_db),user=Depends(patient)):
    return db.query(SavedNextStep).filter_by(patient_id=user.patient_profile.id).all()
@router.post("/next-steps")
def add_step(payload:StepIn,db:Session=Depends(deps.get_db),user=Depends(patient)):
    if payload.urgency not in {"routine","prompt","same_day"}: raise HTTPException(400,"Invalid urgency")
    row=SavedNextStep(patient_id=user.patient_profile.id,text=payload.text,urgency=payload.urgency);db.add(row);db.commit();audit(db,user,"next_step_saved",str(row.id));return row
