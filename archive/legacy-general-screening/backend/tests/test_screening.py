"""
Diagnex Backend — Screening Tests

Tests for diabetes and breast cancer screening endpoints,
including input validation, result format, and disclaimer presence.
"""

from tests.conftest import auth_header


DIABETES_VALID_INPUT = {
    "pregnancies": 6,
    "glucose": 148.0,
    "blood_pressure": 72.0,
    "skin_thickness": 35.0,
    "insulin": 0.0,
    "bmi": 33.6,
    "diabetes_pedigree": 0.627,
    "age": 50,
}

BREAST_CANCER_VALID_INPUT = {
    "mean_radius": 17.99,
    "mean_texture": 10.38,
    "mean_perimeter": 122.8,
    "mean_area": 1001.0,
    "mean_smoothness": 0.1184,
    "mean_compactness": 0.2776,
    "mean_concavity": 0.3001,
    "mean_concave_points": 0.1471,
    "mean_symmetry": 0.2419,
    "mean_fractal_dimension": 0.07871,
}


class TestDiabetesScreening:
    def test_diabetes_screening_success(self, client, patient_token):
        response = client.post(
            "/api/screening/diabetes",
            json=DIABETES_VALID_INPUT,
            headers=auth_header(patient_token),
        )
        assert response.status_code == 201
        data = response.json()
        assert data["screening_type"] == "diabetes"
        assert data["result"] is not None
        result = data["result"]
        assert 0.0 <= result["risk_score"] <= 1.0
        assert result["risk_category"] in ("low", "moderate", "high", "very_high")
        assert result["model_name"] == "diabetes_rf"
        assert result["model_version"] == "1.0.0"
        assert "SCREENING ESTIMATE" in result["ai_disclaimer"]
        assert result["clinician_reviewed"] is False

    def test_diabetes_screening_invalid_glucose(self, client, patient_token):
        bad_input = DIABETES_VALID_INPUT.copy()
        bad_input["glucose"] = 500.0  # Exceeds max
        response = client.post(
            "/api/screening/diabetes",
            json=bad_input,
            headers=auth_header(patient_token),
        )
        assert response.status_code == 422

    def test_diabetes_screening_negative_age(self, client, patient_token):
        bad_input = DIABETES_VALID_INPUT.copy()
        bad_input["age"] = -1
        response = client.post(
            "/api/screening/diabetes",
            json=bad_input,
            headers=auth_header(patient_token),
        )
        assert response.status_code == 422

    def test_diabetes_screening_unauthenticated(self, client):
        response = client.post(
            "/api/screening/diabetes",
            json=DIABETES_VALID_INPUT,
        )
        assert response.status_code == 401


class TestBreastCancerScreening:
    def test_breast_cancer_screening_success(self, client, patient_token):
        response = client.post(
            "/api/screening/breast-cancer",
            json=BREAST_CANCER_VALID_INPUT,
            headers=auth_header(patient_token),
        )
        assert response.status_code == 201
        data = response.json()
        assert data["screening_type"] == "breast_cancer"
        assert data["result"] is not None
        result = data["result"]
        assert 0.0 <= result["risk_score"] <= 1.0
        assert result["risk_category"] in ("low", "moderate", "high", "very_high")
        assert result["model_name"] == "breast_cancer_rf"
        assert "SCREENING ESTIMATE" in result["ai_disclaimer"]
        assert "NOT a medical diagnosis" in result["ai_disclaimer"]

    def test_breast_cancer_screening_out_of_range(self, client, patient_token):
        bad_input = BREAST_CANCER_VALID_INPUT.copy()
        bad_input["mean_area"] = 5000.0  # Exceeds max
        response = client.post(
            "/api/screening/breast-cancer",
            json=bad_input,
            headers=auth_header(patient_token),
        )
        assert response.status_code == 422


class TestScreeningSessions:
    def test_list_sessions_patient(self, client, patient_token):
        # Submit a screening first
        client.post(
            "/api/screening/diabetes",
            json=DIABETES_VALID_INPUT,
            headers=auth_header(patient_token),
        )

        response = client.get(
            "/api/screening/sessions",
            headers=auth_header(patient_token),
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_get_session_detail(self, client, patient_token):
        # Submit
        submit_resp = client.post(
            "/api/screening/diabetes",
            json=DIABETES_VALID_INPUT,
            headers=auth_header(patient_token),
        )
        session_id = submit_resp.json()["id"]

        # Retrieve
        response = client.get(
            f"/api/screening/sessions/{session_id}",
            headers=auth_header(patient_token),
        )
        assert response.status_code == 200
        assert response.json()["id"] == session_id


class TestDisclaimers:
    """Verify that every screening result includes mandatory medical disclaimers."""

    def test_diabetes_has_disclaimer(self, client, patient_token):
        response = client.post(
            "/api/screening/diabetes",
            json=DIABETES_VALID_INPUT,
            headers=auth_header(patient_token),
        )
        result = response.json()["result"]
        assert "NOT a medical diagnosis" in result["ai_disclaimer"]
        assert "clinician review" in result["ai_disclaimer"].lower()

    def test_breast_cancer_has_disclaimer(self, client, patient_token):
        response = client.post(
            "/api/screening/breast-cancer",
            json=BREAST_CANCER_VALID_INPUT,
            headers=auth_header(patient_token),
        )
        result = response.json()["result"]
        assert "SCREENING ESTIMATE" in result["ai_disclaimer"]
        assert "research-only" in result["ai_disclaimer"].lower()
