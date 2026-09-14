"""
Diagnex Backend — File Upload Tests

Tests for file upload, encrypted storage, access control, and download.
"""

import io
from tests.conftest import auth_header


class TestFileUpload:
    def test_upload_pdf_success(self, client, patient_token):
        file_content = b"%PDF-1.4 fake pdf content for testing"
        response = client.post(
            "/api/uploads/",
            files={"file": ("test_report.pdf", io.BytesIO(file_content), "application/pdf")},
            data={"description": "Blood test report"},
            headers=auth_header(patient_token),
        )
        assert response.status_code == 201
        data = response.json()
        assert data["original_filename"] == "test_report.pdf"
        assert data["file_type"] == "application/pdf"
        assert data["description"] == "Blood test report"

    def test_upload_image_success(self, client, patient_token):
        # Minimal valid JPEG header
        file_content = b"\xff\xd8\xff\xe0 fake jpeg"
        response = client.post(
            "/api/uploads/",
            files={"file": ("scan.jpg", io.BytesIO(file_content), "image/jpeg")},
            headers=auth_header(patient_token),
        )
        assert response.status_code == 201


class TestFileAccess:
    def test_list_own_uploads(self, client, patient_token):
        # Upload a file
        client.post(
            "/api/uploads/",
            files={"file": ("test.pdf", io.BytesIO(b"test"), "application/pdf")},
            headers=auth_header(patient_token),
        )

        response = client.get("/api/uploads/", headers=auth_header(patient_token))
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_download_own_file(self, client, patient_token):
        content = b"test file content for download"
        upload_resp = client.post(
            "/api/uploads/",
            files={"file": ("dl_test.pdf", io.BytesIO(content), "application/pdf")},
            headers=auth_header(patient_token),
        )
        file_id = upload_resp.json()["id"]

        response = client.get(
            f"/api/uploads/{file_id}",
            headers=auth_header(patient_token),
        )
        assert response.status_code == 200
        assert response.content == content

    def test_patient_cannot_access_other_patient_file(
        self, client, patient_token, db
    ):
        """A patient should not be able to download another patient's file."""
        # Upload as patient
        upload_resp = client.post(
            "/api/uploads/",
            files={"file": ("private.pdf", io.BytesIO(b"secret"), "application/pdf")},
            headers=auth_header(patient_token),
        )
        file_id = upload_resp.json()["id"]

        # Create a second patient
        from app.core.security import hash_password, create_access_token
        from app.db.models import User, UserRole

        other_user = User(
            email="other@test.com",
            hashed_password=hash_password("Other1Test"),
            full_name="Other Patient",
            role=UserRole.PATIENT,
            is_active=True,
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)
        other_token = create_access_token({"sub": str(other_user.id), "role": "patient"})

        # Try to access the first patient's file
        response = client.get(
            f"/api/uploads/{file_id}",
            headers=auth_header(other_token),
        )
        assert response.status_code == 403


class TestFileDelete:
    def test_delete_own_file(self, client, patient_token):
        upload_resp = client.post(
            "/api/uploads/",
            files={"file": ("delete_me.pdf", io.BytesIO(b"delete"), "application/pdf")},
            headers=auth_header(patient_token),
        )
        file_id = upload_resp.json()["id"]

        response = client.delete(
            f"/api/uploads/{file_id}",
            headers=auth_header(patient_token),
        )
        assert response.status_code == 204

        # Verify it's gone
        response = client.get(
            f"/api/uploads/{file_id}",
            headers=auth_header(patient_token),
        )
        assert response.status_code == 404
