from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.directory import Specialist
from app.core.audit import log_audit_event
router=APIRouter()
@router.get("")
def directory(city:str|None=None,specialty:str|None=None,db:Session=Depends(deps.get_db)):
 q=db.query(Specialist).filter_by(is_active=True)
 if specialty:q=q.filter(Specialist.specialty.ilike(f"%{specialty}%"))
 rows=q.all()
 return [{"id":str(x.id),"full_name":x.full_name,"specialty":x.specialty,"clinic_name":x.clinic_name,"verification_status":x.verification_status,"last_updated_at":x.last_updated_at} for x in rows]
@router.post("/map-search")
def map_search(specialty:str,city:str,db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 # City-level query only; precise browser coordinates are neither received nor stored.
 log_audit_event(db,"specialist_map_search","SpecialistDirectory",user_id=user.id,details={"specialty":specialty,"city":city});return {"logged":True}
