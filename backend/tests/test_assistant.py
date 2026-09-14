import pytest
from fastapi.testclient import TestClient

def test_nlp_extraction_engine():
    from app.services.assistant.extractor import extractor_service
    
    # Test complex extraction
    text = "I have a new painful lump in my left upper breast"
    res = extractor_service.extract(text)
    assert res["side"] == "left"
    assert "upper" in res["location"]
    assert "new lump" in res["symptoms"]
    assert "pain" in res["symptoms"]
    
    # Test bloody discharge overriding generic
    text2 = "There is some bloody discharge from the nipple"
    res2 = extractor_service.extract(text2)
    assert "bloody discharge" in res2["symptoms"]
    assert "nipple discharge" not in res2["symptoms"]

def test_triage_engine_rules():
    from app.services.assistant.triage import triage_service
    
    # Same day rule: bloody discharge
    assert "Same-day" in triage_service.evaluate({"symptoms": ["bloody discharge"]})
    
    # Same day rule: infection (3 signs)
    assert "Same-day" in triage_service.evaluate({"symptoms": ["redness", "warmth", "swelling"]})
    
    # Prompt rule: new lump
    assert "Prompt" in triage_service.evaluate({"symptoms": ["new lump", "pain"]})
    
    # Book rule: pain
    assert "Book" in triage_service.evaluate({"symptoms": ["pain"]})
    
    # Monitor rule: nothing flagged
    assert "Monitor" in triage_service.evaluate({"symptoms": ["something else"]})

def test_state_machine_duplicate_prevention():
    from app.services.assistant.state_machine import state_machine
    
    # If the user gives all info at once, the machine should skip to context or review
    state = None
    text = "I have a painful lump in my left upper breast. I've had it for a few days."
    msg, qr, new_state = state_machine.process_message(text, state)
    
    assert new_state["side"] == "left"
    assert "upper" in new_state["location"]
    assert "new lump" in new_state["symptoms"]
    assert "duration" in new_state["context"]
    
    # It should not ask about side, location, or symptom. It should ask about prior consults
    assert "specialist" in msg.lower() or "review" in msg.lower()

def test_assistant_api_flow(client: TestClient, patient_token_headers: dict):
    # 1. Start session
    resp1 = client.post("/api/v1/assistant/session", headers=patient_token_headers)
    assert resp1.status_code == 201
    data = resp1.json()
    assert "session_id" in data
    session_id = data["session_id"]
    
    # 2. Send message
    payload = {"content": "I have a lump in my right breast"}
    resp2 = client.post(f"/api/v1/assistant/session/{session_id}/message", json=payload, headers=patient_token_headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["cumulative_state"]["side"] == "right"
    assert "new lump" in data2["cumulative_state"]["symptoms"]
    # The next question should probably be location or duration, but definitely not side or symptom
    assert "right" not in data2["quick_replies"]
    
    # 3. Finalize summary
    summary_payload = {
        "finalized_entities": data2["cumulative_state"]
    }
    resp3 = client.put(f"/api/v1/assistant/session/{session_id}/summary", json=summary_payload, headers=patient_token_headers)
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert "Prompt" in data3["triage_category"] # because "new lump" is in symptoms
    
    # 4. Attempting to finalize again should fail
    resp4 = client.put(f"/api/v1/assistant/session/{session_id}/summary", json=summary_payload, headers=patient_token_headers)
    assert resp4.status_code == 400
