from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.api import deps
from app.core.audit import log_audit_event
from app.models.research import ResearchDataset
from app.schemas.research import DatasetRegistration
from app.services.dataset_validation import validate_csv

router = APIRouter()
def research_user(user=Depends(deps.require_role(["admin", "researcher"]))): return user

@router.post("/register")
def register(data: DatasetRegistration, db: Session=Depends(deps.get_db), user=Depends(research_user)):
    if not data.research_only: raise HTTPException(400, "Only approved research datasets are allowed")
    if db.query(ResearchDataset).filter_by(dataset_id=data.dataset_id).first(): raise HTTPException(409, "Dataset ID already exists")
    row=ResearchDataset(dataset_id=data.dataset_id,name=data.name,description=data.source_description,source_url=data.source_url,license=data.license,intended_use=data.intended_use,source_institution=data.source_institution,dataset_version=data.dataset_version,date_obtained=data.date_obtained,patient_count=data.number_of_patients,record_count=data.number_of_records,features=data.features,label_definition=data.label_definition,limitations=data.limitations,approval_status=data.approval_status,research_only=1,created_by_id=user.id)
    db.add(row); db.commit(); db.refresh(row); log_audit_event(db,"dataset_registered","ResearchDataset",str(row.id),user.id,{"dataset_id":data.dataset_id}); return {"id":str(row.id),"dataset_id":row.dataset_id,"status":row.approval_status}

@router.post("/{dataset_id}/validate")
async def upload_and_validate(dataset_id:str,label_column:str=Form(...),file:UploadFile=File(...),db:Session=Depends(deps.get_db),user=Depends(research_user)):
    dataset=db.query(ResearchDataset).filter_by(dataset_id=dataset_id).first()
    if not dataset: raise HTTPException(404,"Dataset not found")
    if not file.filename or not file.filename.lower().endswith(".csv"): raise HTTPException(400,"Only CSV research datasets are accepted")
    raw=Path("ml/data/raw"); raw.mkdir(parents=True,exist_ok=True); target=raw/f"{dataset_id}.csv"; target.write_bytes(await file.read())
    report=validate_csv(target,dataset_id,label_column); dataset.missing_values=report["missing_values"]; dataset.class_balance=report["class_balance"]; dataset.record_count=report["rows"]; db.commit(); log_audit_event(db,"dataset_validated","ResearchDataset",str(dataset.id),user.id,{"dataset_id":dataset_id,"status":report["status"]}); return report

@router.get("")
def list_datasets(db:Session=Depends(deps.get_db),user=Depends(research_user)):
    return [{"dataset_id":d.dataset_id,"name":d.name,"approval_status":d.approval_status,"research_only":bool(d.research_only)} for d in db.query(ResearchDataset).all()]
