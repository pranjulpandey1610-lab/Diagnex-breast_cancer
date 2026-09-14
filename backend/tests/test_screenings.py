from fastapi.testclient import TestClient

def test_patient_can_submit_screening(client: TestClient, patient_token_headers: dict):
    payload = {
        "age": 45,
        "age_at_menarche": 12,
        "age_at_first_birth": 28,
        "history_of_biopsy": False,
        "family_history_breast_cancer": True,
        "birads_density_category": 2
    }
    
    response = client.post("/api/v1/screenings/breast_cancer", json=payload, headers=patient_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert "session_id" in data
    # The real ML model assigns a probability based on the data.
    # We just ensure the outcome is a valid category.
    valid_outcomes = ["lower_risk", "needs_review", "higher_risk"]
    assert data["status"] in valid_outcomes
    assert data["result"]["outcome_category"] in valid_outcomes
    assert "not diagnose" in data["result"]["disclaimer_text"]

def test_invalid_screening_input(client: TestClient, patient_token_headers: dict):
    # age < 18 is rejected by strict schema constraints
    payload = {
        "age": 15, 
        "age_at_menarche": 12,
        "age_at_first_birth": 28,
        "history_of_biopsy": False,
        "family_history_breast_cancer": True,
        "birads_density_category": 2
    }
    
    response = client.post("/api/v1/screenings/breast_cancer", json=payload, headers=patient_token_headers)
    assert response.status_code == 422

def test_guardrail_rejection(client: TestClient, patient_token_headers: dict):
    # Age < 30 with family history triggers the guardrail flag
    payload = {
        "age": 25, 
        "age_at_menarche": 12,
        "age_at_first_birth": None,
        "history_of_biopsy": False,
        "family_history_breast_cancer": True,
        "birads_density_category": 1
    }
    
    response = client.post("/api/v1/screenings/breast_cancer", json=payload, headers=patient_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "needs_review"
    # The flag forces "needs_review" despite young age normally being lower risk
