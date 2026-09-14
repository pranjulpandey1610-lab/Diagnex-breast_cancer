from fastapi.testclient import TestClient

def test_patient_access_patient_routes(client: TestClient, patient_token_headers: dict):
    # Patient should be able to access their own profile
    response = client.get("/api/v1/profiles/me/patient", headers=patient_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Test"

def test_patient_denied_admin_routes(client: TestClient, patient_token_headers: dict):
    # Patient should NOT be able to access admin routes
    response = client.get("/api/v1/admin/audit-logs", headers=patient_token_headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"


def test_admin_access_admin_routes(client: TestClient, admin_token_headers: dict):
    # Admin SHOULD be able to access admin routes
    response = client.get("/api/v1/admin/audit-logs", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_unauthenticated_access_denied(client: TestClient):
    response = client.get("/api/v1/profiles/me/patient")
    assert response.status_code == 401
