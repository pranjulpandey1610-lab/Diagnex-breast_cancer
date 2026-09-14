from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from app.db.session import SessionLocal
from app.models.profile import Profile
from app.core.security import verify_supabase_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> Profile:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        payload = verify_supabase_jwt(token)
        # Supabase JWT uses 'sub' for the user ID
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token structure",
            )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
    
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    if not profile.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return profile

def require_role(required_roles: list[str]):
    def role_checker(current_user: Profile = Depends(get_current_user)):
        if current_user.role == "admin":
            return current_user
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return current_user
    return role_checker

def get_current_admin(current_user: Profile = Depends(require_role(["admin"]))):
    return current_user
