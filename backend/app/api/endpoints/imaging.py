import json
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.api import deps
from app.core.audit import log_audit_event
from app.models.imaging import ImagingStudy, ImagingSeries, ImagingInstance, ArchiveStatus, ImagingWorkflowStatus, ImagingAccessLog
from app.models.user import User
from app.services.dicom_security import validate_dicom, store_encrypted_instance
from app.services.orthanc import upload_instance

router=APIRouter()
@router.post("/dicom")
async def upload_dicom(file:UploadFile=File(...),db:Session=Depends(deps.get_db),user:User=Depends(deps.require_role(["patient"]))):
    if not (file.filename or "").lower().endswith((".dcm",".dicom")): raise HTTPException(400,"Only DICOM files are accepted; photographs are not accepted")
    content=await file.read()
    try: ds,modality=validate_dicom(content); storage_key,_=store_encrypted_instance(content,str(user.patient_profile.id))
    except (ValueError,RuntimeError) as exc: raise HTTPException(400,str(exc))
    study=db.query(ImagingStudy).filter_by(patient_id=user.patient_profile.id,orthanc_study_id=str(ds.StudyInstanceUID)).first()
    if not study: study=ImagingStudy(patient_id=user.patient_profile.id,modality=modality,orthanc_study_id=str(ds.StudyInstanceUID),archive_status=ArchiveStatus.PENDING,workflow_status=ImagingWorkflowStatus.DICOM_VERIFIED.value);db.add(study);db.flush()
    series=db.query(ImagingSeries).filter_by(study_id=study.id,orthanc_series_id=str(getattr(ds,"SeriesInstanceUID",""))).first()
    if not series: series=ImagingSeries(study_id=study.id,orthanc_series_id=str(getattr(ds,"SeriesInstanceUID","")),series_description=str(getattr(ds,"SeriesDescription","")),body_part=str(getattr(ds,"BodyPartExamined","")));db.add(series);db.flush()
    db.add(ImagingInstance(series_id=series.id,sop_instance_uid=str(ds.SOPInstanceUID),encrypted_storage_key=storage_key));db.commit()
    try: upload_instance(content); study.archive_status=ArchiveStatus.ARCHIVED;study.workflow_status=ImagingWorkflowStatus.STORED.value;db.commit()
    except RuntimeError: pass
    log_audit_event(db,"dicom_received","ImagingStudy",str(study.id),user.id,{"modality":modality,"patient_visible":True});return {"study_id":str(study.id),"status":study.workflow_status,"modality":modality}
@router.get("/studies")
def patient_studies(db:Session=Depends(deps.get_db),user:User=Depends(deps.require_role(["patient"]))):
    rows=db.query(ImagingStudy).filter_by(patient_id=user.patient_profile.id).all()
    for row in rows: db.add(ImagingAccessLog(study_id=row.id,user_id=user.id,action="view_status"))
    db.commit();return [{"id":str(r.id),"modality":r.modality,"status":r.workflow_status,"created_at":r.created_at} for r in rows]
