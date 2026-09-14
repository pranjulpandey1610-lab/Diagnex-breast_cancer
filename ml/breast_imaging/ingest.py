"""Approved DICOM ingestion only; patient-facing archive data is never crawled."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
import pydicom
ALLOWED_MODALITIES={"MG","US","MR"}
PHI_FIELDS=("PatientName","PatientID","PatientBirthDate","PatientSex","PatientAddress","PatientTelephoneNumbers","InstitutionName")
def deidentify_dataset(source:Path,target:Path)->dict:
    target.mkdir(parents=True,exist_ok=True); manifest=[]
    for file in source.rglob("*"):
        if not file.is_file(): continue
        ds=pydicom.dcmread(file,force=False)
        if str(getattr(ds,"Modality","")).upper() not in ALLOWED_MODALITIES: continue
        subject=hashlib.sha256(str(getattr(ds,"PatientID","unknown")).encode()).hexdigest()[:20]
        for field in PHI_FIELDS:
            if field in ds: del ds[field]
        ds.PatientID=subject; destination=target/f"{subject}_{getattr(ds,'SOPInstanceUID','instance')}.dcm";ds.save_as(destination)
        manifest.append({"file":destination.name,"subject_id":subject,"modality":str(ds.Modality),"study_uid":str(getattr(ds,"StudyInstanceUID",""))})
    (target/"deidentification_manifest.json").write_text(json.dumps(manifest,indent=2));return {"instances":len(manifest),"manifest":str(target/"deidentification_manifest.json")}
