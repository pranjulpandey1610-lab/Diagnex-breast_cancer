"""DICOM-only intake. This service never accepts phone photographs."""
from __future__ import annotations
import io, os, uuid
from pathlib import Path
import pydicom
from app.services.report_security import encrypt_to_private_store

ALLOWED_MODALITIES={"MG":"mammogram","US":"breast ultrasound","MR":"breast MRI"}
def validate_dicom(content:bytes)->tuple[object,str]:
    if len(content)>500*1024*1024: raise ValueError("DICOM file exceeds 500 MB limit")
    try: dataset=pydicom.dcmread(io.BytesIO(content),force=False)
    except Exception as exc: raise ValueError("Only standards-compliant DICOM is accepted") from exc
    modality=str(getattr(dataset,"Modality","")).upper()
    if modality not in ALLOWED_MODALITIES: raise ValueError("Only mammogram, breast ultrasound, and breast MRI DICOM studies are accepted")
    if not getattr(dataset,"SOPInstanceUID",None) or not getattr(dataset,"StudyInstanceUID",None): raise ValueError("DICOM study and instance identifiers are required")
    return dataset,modality
def store_encrypted_instance(content:bytes,patient_id:str)->tuple[str,str]:
    key=os.getenv("REPORT_ENCRYPTION_KEY")
    if not key: raise RuntimeError("Private storage is not configured")
    location=Path("private_dicom") / patient_id / f"{uuid.uuid4()}.dcm.enc"
    return str(location),encrypt_to_private_store(content,key,location)
