from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api import deps
from app.models.reports import SavedReport, ReportVersion, ReportAccessLog
from app.core.audit import log_audit_event
from app.services.pdf_reports import build_pdf
router=APIRouter()
class SaveReport(BaseModel): title:str; summary:dict={}; uploaded_reports:list=[]; next_steps:list=[]
def own(report_id,db,user):
 row=db.query(SavedReport).filter_by(id=report_id,patient_id=user.patient_profile.id,deleted_at=None).first()
 if not row: raise HTTPException(404,"Saved report not found")
 return row
def logged(db,user,row,action):
 db.add(ReportAccessLog(report_id=row.id,user_id=user.id,action=action));db.commit();log_audit_event(db,"saved_report_"+action,"SavedReport",str(row.id),user.id)
@router.post("")
def save(payload:SaveReport,db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 row=SavedReport(patient_id=user.patient_profile.id,report_type="breast_health_summary",title=payload.title);db.add(row);db.flush();db.add(ReportVersion(report_id=row.id,version_number="1",content_snapshot_json=payload.model_dump()));db.commit();logged(db,user,row,"save");return {"id":str(row.id),"title":row.title}
@router.get("")
def list_reports(db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 return [{"id":str(r.id),"title":r.title,"date":r.generated_at,"status":"Saved report"} for r in db.query(SavedReport).filter_by(patient_id=user.patient_profile.id,deleted_at=None).all()]
@router.get("/{report_id}")
def view(report_id:str,db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 row=own(report_id,db,user);logged(db,user,row,"view");return row.versions[-1].content_snapshot_json
@router.post("/{report_id}/download")
def download(report_id:str,db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 row=own(report_id,db,user);snapshot=row.versions[-1].content_snapshot_json;logged(db,user,row,"download");return Response(build_pdf(str(row.id),snapshot),media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="diagnex-report-{row.id}.pdf"'})
@router.delete("/{report_id}")
def delete(report_id:str,db:Session=Depends(deps.get_db),user=Depends(deps.require_role(["patient"]))):
 from datetime import datetime,timezone
 row=own(report_id,db,user);row.deleted_at=datetime.now(timezone.utc);db.commit();logged(db,user,row,"delete");return {"deleted":True}
