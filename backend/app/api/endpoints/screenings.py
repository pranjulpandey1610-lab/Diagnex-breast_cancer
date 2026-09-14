from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.screening import ScreeningSession, ScreeningInput, ScreeningResult, ScreeningStatus
from app.services.screening import get_screening_module
from app.core.audit import log_audit_event

router = APIRouter()

@router.post("/{disease_type}", status_code=status.HTTP_201_CREATED)
def submit_screening(
    disease_type: str,
    payload: Dict[str, Any],
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.require_role(["patient"]))
):
    """
    Patient submits inputs for a specific disease screening.
    """
    # 1. Load module
    try:
        module = get_screening_module(disease_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        
    # 2. Execute module pipeline (Validates, Preprocesses, Checks Guardrails, Predicts)
    try:
        validated_inputs, result_payload = module.execute(payload)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
        
    # 3. Create Session
    session = ScreeningSession(
        patient_id=current_user.patient_profile.id,
        disease_type=disease_type,
        status=ScreeningStatus.NEEDS_REVIEW if result_payload.outcome_category in ["needs_review", "higher_risk"] else ScreeningStatus.COMPLETED
    )
    db.add(session)
    db.flush()
    
    # 4. Store Inputs
    screening_input = ScreeningInput(
        session_id=session.id,
        payload=validated_inputs
    )
    db.add(screening_input)
    
    # 5. Store Results
    screening_result = ScreeningResult(
        session_id=session.id,
        model_version=result_payload.model_version,
        dataset_version=result_payload.dataset_version,
        risk_probability=result_payload.risk_probability,
        outcome_category=result_payload.outcome_category,
        confidence_score=result_payload.confidence_score,
        clinical_flags=result_payload.clinical_flags,
        disclaimer_text=result_payload.disclaimer_text,
        safe_result_text=result_payload.safe_result_text
    )
    db.add(screening_result)
    
    db.commit()
    db.refresh(session)
    
    log_audit_event(db, action="screening_submitted", resource="ScreeningSession", resource_id=str(session.id), user_id=current_user.id)
    
    return {
        "session_id": session.id,
        "status": session.status,
        "result": {
            "outcome_category": screening_result.outcome_category,
            "disclaimer_text": screening_result.disclaimer_text,
            "safe_result_text": screening_result.safe_result_text
        }
    }

@router.get("/{session_id}")
def get_screening(
    session_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_user)
):
    """
    Retrieve a screening session.
    Patients can view their own. Admins can view all.
    """
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")
        
    user_roles = [r.name for r in current_user.roles]
    
    # Authorization checks
    if "admin" in user_roles:
        pass # Admins can view all
    elif "patient" in user_roles:
        if session.patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this screening")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    log_audit_event(db, action="screening_viewed", resource="ScreeningSession", resource_id=str(session.id), user_id=current_user.id)
    
    return {
        "id": session.id,
        "disease_type": session.disease_type,
        "status": session.status,
        "inputs": session.inputs.payload if session.inputs else None,
        "result": {
            "outcome_category": session.result.outcome_category,
            "disclaimer_text": session.result.disclaimer_text,
            "safe_result_text": session.result.safe_result_text,
            "clinical_flags": session.result.clinical_flags
        } if session.result else None
    }

