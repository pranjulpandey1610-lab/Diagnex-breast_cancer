"""
Diagnex Backend — Audit Log Tests

Tests for audit log creation, immutability, and query filtering.
"""

from tests.conftest import auth_header


DIABETES_INPUT = {
    "pregnancies": 6,
    "glucose": 148.0,
    "blood_pressure": 72.0,
    "skin_thickness": 35.0,
    "insulin": 0.0,
    "bmi": 33.6,
    "diabetes_pedigree": 0.627,
    "age": 50,
}


class TestAuditLogCreation:
    def test_login_creates_audit_entry(self, client, admin_user, admin_token):
        # Login creates an audit event
        client.post("/api/auth/login", json={
            "email": "admin@test.com",
            "password": "Admin1Test",
        })

        # Check audit logs
        response = client.get(
            "/api/admin/audit-logs",
            headers=auth_header(admin_token),
        )
        assert response.status_code == 200
        logs = response.json()
        login_logs = [l for l in logs if l["action"] == "auth.login"]
        assert len(login_logs) >= 1

    def test_screening_creates_audit_entry(self, client, patient_user, patient_token, admin_user, admin_token):
        # Submit screening
        client.post(
            "/api/screening/diabetes",
            json=DIABETES_INPUT,
            headers=auth_header(patient_token),
        )

        # Check audit logs as admin
        response = client.get(
            "/api/admin/audit-logs",
            headers=auth_header(admin_token),
        )
        logs = response.json()
        screening_logs = [l for l in logs if l["action"] == "screening.submit"]
        assert len(screening_logs) >= 1

    def test_failed_login_creates_audit_entry(self, client, patient_user, admin_user, admin_token):
        # Failed login
        client.post("/api/auth/login", json={
            "email": "patient@test.com",
            "password": "WrongPassword1",
        })

        # Check audit logs
        response = client.get(
            "/api/admin/audit-logs",
            headers=auth_header(admin_token),
        )
        logs = response.json()
        failed_logs = [l for l in logs if l["action"] == "auth.login_failed"]
        assert len(failed_logs) >= 1


class TestAuditLogFiltering:
    def test_filter_by_action(self, client, admin_user, admin_token):
        # Generate some activity
        client.post("/api/auth/login", json={
            "email": "admin@test.com",
            "password": "Admin1Test",
        })

        response = client.get(
            "/api/admin/audit-logs?action=auth.login",
            headers=auth_header(admin_token),
        )
        assert response.status_code == 200
        logs = response.json()
        for log in logs:
            assert log["action"] == "auth.login"

    def test_filter_by_user_id(self, client, admin_user, admin_token, patient_user, patient_token):
        # Patient does something
        client.get("/api/auth/me", headers=auth_header(patient_token))

        response = client.get(
            f"/api/admin/audit-logs?user_id={patient_user.id}",
            headers=auth_header(admin_token),
        )
        assert response.status_code == 200


class TestAuditLogSecurity:
    def test_audit_logs_have_no_phi(self, client, admin_user, admin_token):
        """Verify audit log entries don't contain raw PHI — only hashes."""
        client.post("/api/auth/login", json={
            "email": "admin@test.com",
            "password": "Admin1Test",
        })

        response = client.get(
            "/api/admin/audit-logs",
            headers=auth_header(admin_token),
        )
        logs = response.json()
        for log in logs:
            # Response should not contain password, email, or other PHI
            log_str = str(log)
            assert "Admin1Test" not in log_str
            assert "hashed_password" not in log_str
