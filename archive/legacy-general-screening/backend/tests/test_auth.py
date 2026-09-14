"""
Diagnex Backend — Auth Tests

Tests for registration, login, token refresh, and unauthorized access.
"""

from tests.conftest import auth_header


class TestRegistration:
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "email": "newuser@test.com",
            "password": "SecurePass1",
            "full_name": "New User",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "patient"  # Default role
        assert data["is_active"] is True
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client, patient_user):
        response = client.post("/api/auth/register", json={
            "email": "patient@test.com",
            "password": "SecurePass1",
            "full_name": "Duplicate User",
        })
        assert response.status_code == 409

    def test_register_weak_password(self, client):
        response = client.post("/api/auth/register", json={
            "email": "weak@test.com",
            "password": "short",
            "full_name": "Weak Password",
        })
        assert response.status_code == 422

    def test_register_missing_uppercase(self, client):
        response = client.post("/api/auth/register", json={
            "email": "noup@test.com",
            "password": "nouppercase1",
            "full_name": "No Uppercase",
        })
        assert response.status_code == 422

    def test_register_missing_digit(self, client):
        response = client.post("/api/auth/register", json={
            "email": "nodigit@test.com",
            "password": "NoDigitHere",
            "full_name": "No Digit",
        })
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, patient_user):
        response = client.post("/api/auth/login", json={
            "email": "patient@test.com",
            "password": "Patient1Test",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, patient_user):
        response = client.post("/api/auth/login", json={
            "email": "patient@test.com",
            "password": "WrongPassword1",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post("/api/auth/login", json={
            "email": "nobody@test.com",
            "password": "NoOne1Here",
        })
        assert response.status_code == 401


class TestTokenRefresh:
    def test_refresh_success(self, client, patient_user):
        # Login first
        login_resp = client.post("/api/auth/login", json={
            "email": "patient@test.com",
            "password": "Patient1Test",
        })
        refresh_token = login_resp.json()["refresh_token"]

        # Refresh
        response = client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        response = client.post("/api/auth/refresh", json={
            "refresh_token": "invalid-token",
        })
        assert response.status_code == 401


class TestMe:
    def test_get_me_authenticated(self, client, patient_user, patient_token):
        response = client.get("/api/auth/me", headers=auth_header(patient_token))
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "patient@test.com"
        assert data["role"] == "patient"

    def test_get_me_unauthenticated(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401
