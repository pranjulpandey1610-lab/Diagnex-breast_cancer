from pathlib import Path
import os, uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.api import deps
from app.core.audit import log_audit_event
from app.models.uploads import Upload, UploadedDocument, UploadStatus, DocumentExtractionStatus
from app.models.user import User
from app.services.report_security import validate_upload, clamav_scan, encrypt_to_private_store

router=APIRouter(); CATEGORIES={"mammogram report","breast ultrasound report","breast MRI report","pathology report","biopsy report","genetic test report","referral letter","other clinical report"}
@router.post("")
async def upload_report(category:str=Form(...),file:UploadFile=File(...),db:Session=Depends(deps.get_db),user:User=Depends(deps.require_role(["patient"]))):
    if category not in CATEGORIES: raise HTTPException(400,"Unsupported report category")
    if not user.patient_profile: raise HTTPException(403,"Patient profile required")
    content=await file.read()
    try: mime=validate_upload(file.filename or "",file.content_type or "",content)
    except ValueError as exc: raise HTTPException(400,str(exc))
    scan=clamav_scan(content)
    if scan != "clean": raise HTTPException(503,"File cannot be accepted until malware scanning is available and clean")
    key=os.getenv("REPORT_ENCRYPTION_KEY")
    if not key: raise HTTPException(503,"Private report storage is not configured")
    storage_key=f"{user.patient_profile.id}/{uuid.uuid4()}.enc"; digest=encrypt_to_private_store(content,key,Path("private_reports")/storage_key)
    upload=Upload(patient_id=user.patient_profile.id,original_filename=file.filename,secure_storage_key=storage_key,content_type=mime,file_size=len(content),sha256_hash=digest,upload_status=UploadStatus.CLEAN,malware_scan_status=scan)
    db.add(upload);db.flush();db.add(UploadedDocument(upload_id=upload.id,document_type=category,extraction_status=DocumentExtractionStatus.PENDING));db.commit();log_audit_event(db,"report_uploaded","Upload",str(upload.id),user.id,{"category":category,"content_type":mime});return {"upload_id":str(upload.id),"status":"clean","message":"Stored privately; local extraction will be queued."}
