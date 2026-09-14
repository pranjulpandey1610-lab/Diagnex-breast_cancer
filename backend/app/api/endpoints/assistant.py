from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import UUID4

from app.api import deps
from app.models.user import User
from app.models.breast_awareness import (
    BreastAwarenessSession,
    BreastSymptomEntry,
    BreastLocationEntry,
    BreastSummaryReport,
    BreastTriageResult,
    SessionStatus,
    EntrySource
)
from app.schemas.breast_awareness import MessageRequest, SummaryRequest, SessionResponse, SummaryResponse
from app.services.assistant import state_machine, triage_service
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/session/{session_id}")
def get_session(
    session_id: UUID4,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_role(["patient"])),
):
    """Return only the requesting patient's editable assistant state."""
    session = db.query(BreastAwarenessSession).filter(
        BreastAwarenessSession.id == session_id,
        BreastAwarenessSession.patient_id == current_user.patient_profile.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    latest_prompt = db.query(BreastSymptomEntry).filter(
        BreastSymptomEntry.session_id == session.id,
        BreastSymptomEntry.symptom_type == "system_prompt",
    ).order_by(BreastSymptomEntry.created_at.desc()).first()
    return {
        "session_id": str(session.id),
        "status": session.status.value if hasattr(session.status, "value") else session.status,
        "cumulative_state": session.cumulative_state or {"side": None, "location": [], "symptoms": [], "context": []},
        "assistant_message": latest_prompt.value if latest_prompt else "Describe any new or persistent breast change you have noticed.",
    }

@router.post("/session", status_code=status.HTTP_201_CREATED, response_model=SessionResponse)
def start_session(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_role(["patient"]))
):
    """Start a new breast self-awareness assistant session."""
    session = BreastAwarenessSession(patient_id=current_user.patient_profile.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Generate initial greeting
    greeting_text, quick_replies, state = state_machine.process_message("", None)
    
    msg = BreastSymptomEntry(
        session_id=session.id,
        symptom_type="system_greeting",
        value=greeting_text,
        source=EntrySource.MANUAL
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    log_audit_event(db, action="assistant_session_started", resource="BreastAwarenessSession", resource_id=str(session.id), user_id=current_user.id)
    
    return {
        "session_id": session.id,
        "status": session.status,
        "assistant_message": greeting_text,
        "quick_replies": quick_replies,
        "cumulative_state": state
    }

@router.post("/session/{session_id}/message", response_model=SessionResponse)
def send_message(
    session_id: UUID4,
    payload: MessageRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_role(["patient"]))
):
    """Send a message to the assistant and get a reply."""
    session = db.query(BreastAwarenessSession).filter(
        BreastAwarenessSession.id == session_id,
        BreastAwarenessSession.patient_id == current_user.patient_profile.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status == SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Session is already completed")
    
    # Normally we would fetch current_state. This is a simplified mock as requested for the refactor.
    current_state = session.cumulative_state or None
    
    # Save user message
    user_msg = BreastSymptomEntry(
        session_id=session.id,
        symptom_type="user_input",
        value=payload.content,
        source=EntrySource.NATURAL_LANGUAGE
    )
    db.add(user_msg)
    
    # Process through state machine
    next_question, quick_replies, updated_state = state_machine.process_message(payload.content, current_state)
    session.cumulative_state = updated_state

    for location in updated_state.get("location", []):
        if not any(entry.region == location for entry in session.location_entries):
            session.location_entries.append(BreastLocationEntry(region=location, side=updated_state.get("side")))
    
    # Save assistant message
    assistant_msg = BreastSymptomEntry(
        session_id=session.id,
        symptom_type="system_prompt",
        value=next_question,
        source=EntrySource.MANUAL.value
    )
    db.add(assistant_msg)
    db.commit()
    
    return {
        "session_id": session.id,
        "status": session.status,
        "assistant_message": next_question,
        "quick_replies": quick_replies,
        "cumulative_state": updated_state
    }

@router.put("/session/{session_id}/summary", response_model=SummaryResponse)
def finalize_summary(
    session_id: UUID4,
    payload: SummaryRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_role(["patient"]))
):
    """
    User submits the finalized list of symptoms after editing chips on the UI.
    This triggers the triage rules engine.
    """
    session = db.query(BreastAwarenessSession).filter(
        BreastAwarenessSession.id == session_id,
        BreastAwarenessSession.patient_id == current_user.patient_profile.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.summary_report:
        raise HTTPException(status_code=400, detail="Summary already finalized")
        
    # Run strict triage engine
    triage = triage_service.evaluate(payload.finalized_entities)
    
    triage_obj = BreastTriageResult(
        session_id=session.id,
        triage_level=triage["label"],
        recommended_action=triage["action"],
        disclaimer="This organizes user-entered information. It is not a diagnosis and does not replace clinical examination, imaging interpretation, pathology testing, or advice from a qualified healthcare professional."
    )
    db.add(triage_obj)

    summary = BreastSummaryReport(
        session_id=session.id,
        structured_summary=payload.finalized_entities
    )
    db.add(summary)
    
    session.status = SessionStatus.COMPLETED
    db.commit()
    db.refresh(summary)
    db.refresh(triage_obj)
    
    log_audit_event(db, action="assistant_summary_finalized", resource="BreastAwarenessSession", resource_id=str(session.id), user_id=current_user.id)
    
    return {
        "triage_category": triage_obj.triage_level,
        "guidance_level": triage["level"],
        "information_completion_percent": triage["completion_percent"],
        "recommended_action": triage["action"],
        "assessment_options": triage["assessment_options"],
        "disclaimer": triage_obj.disclaimer,
        "finalized_entities": summary.structured_summary
    }
