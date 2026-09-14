"""
Diagnex Backend — Screening Router

Endpoints for submitting screening forms and viewing results.
All results include mandatory medical disclaimers.
"""

import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.api.schemas import (
    BreastCancerScreeningInput,
    DiabetesScreeningInput,
    ESCALATION_GUIDANCE,
    MEDICAL_DISCLAIMER,
    ScreeningResultResponse,
    ScreeningSessionResponse,
)
from app.core.audit import log_event
from app.core.security import encrypt_string
from app.db.base import get_db
from app.db.models import (
    ScreeningResult,
    ScreeningSession,
    ScreeningType,
    RiskCategory,
    User,
    UserRole,
)
from app.ml import diabetes_model, breast_cancer_model

router = APIRouter(prefix="/api/screening", tags=["Screening"])


@router.post(
    "/diabetes",
    response_model=ScreeningSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit diabetes risk screening",
)
def screen_diabetes(
    data: DiabetesScreeningInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run the diabetes risk screening model on the submitted clinical features.
    Returns a screening session with the AI result and mandatory medical disclaimer.

    ⚠️ SCREENING ESTIMATE ONLY — NOT A MEDICAL DIAGNOSIS
    """
    # Run inference
    features = data.model_dump()
    prediction = diabetes_model.predict(features)

    # Encrypt input data before storage (PHI protection)
    encrypted_input = encrypt_string(json.dumps(features))

    # Create session
    session = ScreeningSession(
        patient_id=current_user.id,
        screening_type=ScreeningType.DIABETES,
        input_data_encrypted=encrypted_input,
    )
    db.add(session)
    db.flush()

    # Prepare explanation
    explanation = json.dumps({
        "feature_importance": prediction["feature_importance"],
        "screening_disclaimer": MEDICAL_DISCLAIMER,
        "escalation_guidance": ESCALATION_GUIDANCE if prediction["risk_category"] in ("high", "very_high") else None,
    })

    # Create result
    result = ScreeningResult(
        session_id=session.id,
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        dataset_version=prediction["dataset_version"],
        risk_score=prediction["risk_score"],
        risk_category=RiskCategory(prediction["risk_category"]),
        explanation=explanation,
        clinician_reviewed=False,
    )
    db.add(result)
    db.commit()
    db.refresh(session)

    # Audit log
    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="screening.submit",
        resource="screening_session",
        resource_id=str(session.id),
        ip_address=request.client.host if request.client else None,
        details={"screening_type": "diabetes", "risk_category": prediction["risk_category"]},
    )

    return _session_to_response(session)


@router.post(
    "/breast-cancer",
    response_model=ScreeningSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit breast cancer risk screening",
)
def screen_breast_cancer(
    data: BreastCancerScreeningInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run the breast cancer risk screening model on the submitted cell-nuclei features.
    Returns a screening session with the AI result and mandatory medical disclaimer.

    ⚠️ RESEARCH-ONLY SCREENING ESTIMATE — NOT A MEDICAL DIAGNOSIS
    """
    features = data.model_dump()
    prediction = breast_cancer_model.predict(features)

    encrypted_input = encrypt_string(json.dumps(features))

    session = ScreeningSession(
        patient_id=current_user.id,
        screening_type=ScreeningType.BREAST_CANCER,
        input_data_encrypted=encrypted_input,
    )
    db.add(session)
    db.flush()

    explanation = json.dumps({
        "feature_importance": prediction["feature_importance"],
        "screening_disclaimer": MEDICAL_DISCLAIMER,
        "escalation_guidance": ESCALATION_GUIDANCE if prediction["risk_category"] in ("high", "very_high") else None,
    })

    result = ScreeningResult(
        session_id=session.id,
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        dataset_version=prediction["dataset_version"],
        risk_score=prediction["risk_score"],
        risk_category=RiskCategory(prediction["risk_category"]),
        explanation=explanation,
        clinician_reviewed=False,
    )
    db.add(result)
    db.commit()
    db.refresh(session)

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="screening.submit",
        resource="screening_session",
        resource_id=str(session.id),
        ip_address=request.client.host if request.client else None,
        details={"screening_type": "breast_cancer", "risk_category": prediction["risk_category"]},
    )

    return _session_to_response(session)


@router.get(
    "/sessions",
    response_model=list[ScreeningSessionResponse],
    summary="List screening sessions",
)
def list_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """
    List screening sessions.
    - Patients see only their own sessions.
    - Doctors and admins see all sessions.
    """
    query = db.query(ScreeningSession)

    if current_user.role == UserRole.PATIENT:
        query = query.filter(ScreeningSession.patient_id == current_user.id)

    sessions = (
        query.order_by(ScreeningSession.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_session_to_response(s) for s in sessions]


@router.get(
    "/sessions/{session_id}",
    response_model=ScreeningSessionResponse,
    summary="Get screening session details",
)
def get_session(
    session_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific screening session with its result."""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found.")

    # Patients can only view their own
    if current_user.role == UserRole.PATIENT and session.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="screening.view",
        resource="screening_session",
        resource_id=str(session.id),
        ip_address=request.client.host if request.client else None,
    )

    return _session_to_response(session)


def _session_to_response(session: ScreeningSession) -> ScreeningSessionResponse:
    """Convert a ScreeningSession ORM object to a response schema."""
    result_resp = None
    if session.result:
        r = session.result
        result_resp = ScreeningResultResponse(
            id=r.id,
            session_id=r.session_id,
            screening_type=session.screening_type.value,
            model_name=r.model_name,
            model_version=r.model_version,
            dataset_version=r.dataset_version,
            risk_score=r.risk_score,
            risk_category=r.risk_category.value,
            explanation=r.explanation,
            ai_disclaimer=r.ai_disclaimer,
            clinician_reviewed=r.clinician_reviewed,
            reviewed_by=r.reviewed_by,
            clinical_notes=r.clinical_notes,
            reviewed_at=r.reviewed_at,
            created_at=r.created_at,
        )

    return ScreeningSessionResponse(
        id=session.id,
        patient_id=session.patient_id,
        screening_type=session.screening_type.value,
        created_at=session.created_at,
        result=result_resp,
    )
