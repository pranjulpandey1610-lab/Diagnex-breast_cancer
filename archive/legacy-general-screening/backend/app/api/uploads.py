"""
Diagnex Backend — File Upload Router

Secure file upload with encryption at rest. Files are stored with
UUID-based names (no PHI in filenames) and encrypted using Fernet.
"""

import hashlib
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.api.schemas import FileUploadResponse
from app.core.audit import log_event
from app.core.config import get_settings
from app.core.security import decrypt_data, decrypt_string, encrypt_data, encrypt_string
from app.db.base import get_db
from app.db.models import FileUpload, User, UserRole

router = APIRouter(prefix="/api/uploads", tags=["File Uploads"])

ALLOWED_FILE_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/dicom",
    "application/dicom",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


@router.post(
    "/",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a lab report or medical image",
)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    description: str = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a medical file (PDF, image, DICOM, CSV).
    The file is encrypted at rest and stored with a UUID-based filename.
    Original filename is also encrypted.
    """
    settings = get_settings()

    # Validate file type
    if file.content_type and file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not allowed. "
                   f"Allowed: {', '.join(ALLOWED_FILE_TYPES)}",
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Encrypt file content
    encrypted_content = encrypt_data(content)

    # Generate secure storage filename (no PHI)
    stored_filename = f"{uuid.uuid4().hex}.enc"
    file_path = settings.upload_path / stored_filename

    # Write encrypted file
    file_path.write_bytes(encrypted_content)

    # Hash of encrypted content for integrity verification
    file_hash = hashlib.sha256(encrypted_content).hexdigest()

    # Encrypt original filename
    original_name = file.filename or "unnamed"
    encrypted_filename = encrypt_string(original_name)

    # Create database record
    upload = FileUpload(
        patient_id=current_user.id,
        original_filename_encrypted=encrypted_filename,
        stored_filename=stored_filename,
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=len(content),
        file_hash=file_hash,
        description=description,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    # Audit log
    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="file.upload",
        resource="file_upload",
        resource_id=str(upload.id),
        ip_address=request.client.host if request.client else None,
        details={"file_type": file.content_type, "size_bytes": len(content)},
    )

    return FileUploadResponse(
        id=upload.id,
        original_filename=original_name,
        file_type=upload.file_type,
        file_size_bytes=upload.file_size_bytes,
        description=upload.description,
        uploaded_at=upload.uploaded_at,
    )


@router.get(
    "/",
    response_model=list[FileUploadResponse],
    summary="List uploaded files",
)
def list_uploads(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """
    List uploaded files.
    Patients see only their own files. Doctors and admins see all.
    """
    query = db.query(FileUpload)

    if current_user.role == UserRole.PATIENT:
        query = query.filter(FileUpload.patient_id == current_user.id)

    uploads = (
        query.order_by(FileUpload.uploaded_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for u in uploads:
        original_name = decrypt_string(u.original_filename_encrypted) or "encrypted"
        results.append(
            FileUploadResponse(
                id=u.id,
                original_filename=original_name,
                file_type=u.file_type,
                file_size_bytes=u.file_size_bytes,
                description=u.description,
                uploaded_at=u.uploaded_at,
            )
        )

    return results


@router.get(
    "/{upload_id}",
    summary="Download an uploaded file",
)
def download_file(
    upload_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Download a specific uploaded file.
    Patients can only download their own files. Doctors and admins can download any.
    """
    settings = get_settings()
    upload = db.query(FileUpload).filter(FileUpload.id == upload_id).first()

    if not upload:
        raise HTTPException(status_code=404, detail="File not found.")

    # Access control
    if current_user.role == UserRole.PATIENT and upload.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Read and decrypt
    file_path = settings.upload_path / upload.stored_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File data not found on server.")

    encrypted_content = file_path.read_bytes()
    decrypted_content = decrypt_data(encrypted_content)

    if decrypted_content is None:
        raise HTTPException(status_code=500, detail="Failed to decrypt file.")

    # Decrypt original filename
    original_name = decrypt_string(upload.original_filename_encrypted) or "download"

    # Audit log
    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="file.download",
        resource="file_upload",
        resource_id=str(upload.id),
        ip_address=request.client.host if request.client else None,
    )

    return Response(
        content=decrypted_content,
        media_type=upload.file_type,
        headers={"Content-Disposition": f'attachment; filename="{original_name}"'},
    )


@router.delete(
    "/{upload_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an uploaded file",
)
def delete_file(
    upload_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete an uploaded file. Patients can delete their own files.
    Admins can delete any file.
    """
    settings = get_settings()
    upload = db.query(FileUpload).filter(FileUpload.id == upload_id).first()

    if not upload:
        raise HTTPException(status_code=404, detail="File not found.")

    if current_user.role == UserRole.PATIENT and upload.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    elif current_user.role not in (UserRole.PATIENT, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Access denied.")

    # Delete physical file
    file_path = settings.upload_path / upload.stored_filename
    if file_path.exists():
        file_path.unlink()

    # Audit before delete
    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="file.delete",
        resource="file_upload",
        resource_id=str(upload.id),
        ip_address=request.client.host if request.client else None,
    )

    db.delete(upload)
    db.commit()
