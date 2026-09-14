import uuid
from typing import Optional
from supabase import create_client, Client
from fastapi import UploadFile

from app.core.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class SupabaseStorageService:
    def __init__(self, bucket_name: str):
        self.client = get_supabase_client()
        self.bucket_name = bucket_name

    ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}

    def upload_file(self, file_content: bytes, content_type: str, patient_id: str) -> str:
        """
        Uploads a file to the specified bucket and returns the generated UUID filename.
        """
        if content_type not in self.ALLOWED_CONTENT_TYPES:
            raise ValueError("Only PDF, JPG, and PNG reports may be stored")
        file_id = str(uuid.uuid4())
        file_path = f"{patient_id}/{file_id}"
        
        res = self.client.storage.from_(self.bucket_name).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": content_type}
        )
        return file_path

    def get_signed_url(self, file_id: str, expires_in: int = 3600) -> Optional[str]:
        """
        Generates a signed URL for secure file download.
        """
        res = self.client.storage.from_(self.bucket_name).create_signed_url(
            path=file_id,
            expires_in=expires_in
        )
        # res returns a dict like {'signedURL': 'https://...'}
        return res.get('signedURL') if res else None

# Pre-configured instances
patient_reports_storage = SupabaseStorageService("patient-reports")
generated_reports_storage = SupabaseStorageService("generated-reports")
temporary_uploads_storage = SupabaseStorageService("temporary-uploads")
