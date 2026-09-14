"""
Diagnex Backend — Review Router

Endpoints for clinicians (doctors) to review AI screening results.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.api.schemas import ReviewSubmit, ReviewResponse
from app.core.audit import log_event
from app.db.base import get_db
from app.db.models import ScreeningResult, ScreeningSession, User, UserRole

router = APIRouter(prefix="/api/review", tags=["Clinical Review"])


@router.get(
    "/pending",
    response_model=list[ReviewResponse],
    dependencies=[Depends(require_role(UserRole.DOCTOR, UserRole.ADMIN))],
    summary="List pending AI results for clinician review",
)
def list_pending_reviews(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """
    List all screening results that have NOT been reviewed by a clinician.
    Only accessible to doctors and admins.
    """
    results = (
        db.query(ScreeningResult)
        .join(ScreeningSession)
        .filter(ScreeningResult.clinician_reviewed == False)
        .order_by(ScreeningResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_result_to_review_response(r, db) for r in results]


@router.get(
    "/all",
    response_model=list[ReviewResponse],
    dependencies=[Depends(require_role(UserRole.DOCTOR, UserRole.ADMIN))],
    summary="List all screening results",
)
def list_all_reviews(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """List all screening results (reviewed and pending). Doctors and admins only."""
    results = (
        db.query(ScreeningResult)
        .join(ScreeningSession)
        .order_by(ScreeningResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_result_to_review_response(r, db) for r in results]


@router.patch(
    "/{result_id}",
    response_model=ReviewResponse,
    dependencies=[Depends(require_role(UserRole.DOCTOR, UserRole.ADMIN))],
    summary="Submit clinician review for an AI result",
)
def submit_review(
    result_id: int,
    data: ReviewSubmit,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark an AI screening result as clinician-reviewed.
    The doctor adds clinical notes and indicates approval.
    """
    result = db.query(ScreeningResult).filter(ScreeningResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Screening result not found.")

    if result.clinician_reviewed:
        raise HTTPException(
            status_code=400,
            detail="This result has already been reviewed.",
        )

    result.clinician_reviewed = True
    result.reviewed_by = current_user.id
    result.clinical_notes = data.clinical_notes
    result.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(result)

    log_event(
        db,
        user_id=current_user.id,
        role=current_user.role.value,
        action="review.submit",
        resource="screening_result",
        resource_id=str(result.id),
        ip_address=request.client.host if request.client else None,
        details={"clinician_approved": data.clinician_approved},
    )

    return _result_to_review_response(result, db)


def _result_to_review_response(result: ScreeningResult, db: Session) -> ReviewResponse:
    """Convert a ScreeningResult to a ReviewResponse with patient info."""
    session = db.query(ScreeningSession).filter(
        ScreeningSession.id == result.session_id
    ).first()

    patient_name = None
    screening_type = None
    if session:
        screening_type = session.screening_type.value
        patient = db.query(User).filter(User.id == session.patient_id).first()
        if patient:
            patient_name = patient.full_name

    return ReviewResponse(
        id=result.id,
        session_id=result.session_id,
        model_name=result.model_name,
        risk_score=result.risk_score,
        risk_category=result.risk_category.value,
        clinician_reviewed=result.clinician_reviewed,
        reviewed_by=result.reviewed_by,
        clinical_notes=result.clinical_notes,
        reviewed_at=result.reviewed_at,
        patient_name=patient_name,
        screening_type=screening_type,
    )
