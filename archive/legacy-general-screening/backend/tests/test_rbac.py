"""
Diagnex Backend — RBAC Tests

Tests that role-based access control is properly enforced.
"""

from tests.conftest import auth_header


class TestPatientAccessRestrictions:
    """Patients should NOT access admin, review, or user management endpoints."""

    def test_patient_cannot_list_users(self, client, patient_token):
        response = client.get("/api/users/", headers=auth_header(patient_token))
        assert response.status_code == 403

    def test_patient_cannot_view_audit_logs(self, client, patient_token):
        response = client.get("/api/admin/audit-logs", headers=auth_header(patient_token))
        assert response.status_code == 403

    def test_patient_cannot_view_stats(self, client, patient_token):
        response = client.get("/api/admin/stats", headers=auth_header(patient_token))
        assert response.status_code == 403

    def test_patient_cannot_list_pending_reviews(self, client, patient_token):
        response = client.get("/api/review/pending", headers=auth_header(patient_token))
        assert response.status_code == 403

    def test_patient_cannot_change_roles(self, client, patient_token, doctor_user):
        response = client.patch(
            f"/api/users/{doctor_user.id}/role",
            json={"role": "admin"},
            headers=auth_header(patient_token),
        )
        assert response.status_code == 403


class TestDoctorAccess:
    """Doctors should access review endpoints but NOT admin management."""

    def test_doctor_can_list_pending_reviews(self, client, doctor_token):
        response = client.get("/api/review/pending", headers=auth_header(doctor_token))
        assert response.status_code == 200

    def test_doctor_cannot_list_users(self, client, doctor_token):
        response = client.get("/api/users/", headers=auth_header(doctor_token))
        assert response.status_code == 403

    def test_doctor_cannot_view_audit_logs(self, client, doctor_token):
        response = client.get("/api/admin/audit-logs", headers=auth_header(doctor_token))
        assert response.status_code == 403


class TestAdminAccess:
    """Admins should access all admin endpoints."""

    def test_admin_can_list_users(self, client, admin_token):
        response = client.get("/api/users/", headers=auth_header(admin_token))
        assert response.status_code == 200

    def test_admin_can_view_audit_logs(self, client, admin_token):
        response = client.get("/api/admin/audit-logs", headers=auth_header(admin_token))
        assert response.status_code == 200

    def test_admin_can_view_stats(self, client, admin_token):
        response = client.get("/api/admin/stats", headers=auth_header(admin_token))
        assert response.status_code == 200

    def test_admin_can_list_pending_reviews(self, client, admin_token):
        response = client.get("/api/review/pending", headers=auth_header(admin_token))
        assert response.status_code == 200


class TestResearcherAccess:
    """Researchers should access model registry but NOT patient data."""

    def test_researcher_can_list_models(self, client, researcher_token):
        response = client.get("/api/admin/models", headers=auth_header(researcher_token))
        assert response.status_code == 200

    def test_researcher_cannot_list_users(self, client, researcher_token):
        response = client.get("/api/users/", headers=auth_header(researcher_token))
        assert response.status_code == 403

    def test_researcher_cannot_view_audit_logs(self, client, researcher_token):
        response = client.get(
            "/api/admin/audit-logs", headers=auth_header(researcher_token)
        )
        assert response.status_code == 403


class TestUnauthenticatedAccess:
    """Unauthenticated requests should be rejected."""

    def test_no_token_screening(self, client):
        response = client.post("/api/screening/diabetes", json={})
        assert response.status_code == 401

    def test_no_token_uploads(self, client):
        response = client.get("/api/uploads/")
        assert response.status_code == 401

    def test_no_token_users(self, client):
        response = client.get("/api/users/")
        assert response.status_code == 401

    def test_invalid_token(self, client):
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer totally-fake-token"},
        )
        assert response.status_code == 401
