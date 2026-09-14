from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.profile import Profile

router = APIRouter()

@router.get("/me", response_model=None)
def get_current_user_info(
    db: Session = Depends(deps.get_db),
    current_user: Profile = Depends(deps.get_current_user)
):
    """
    Returns the currently authenticated user based on Supabase JWT.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "roles": [current_user.role],
        "is_active": current_user.is_active
    }
