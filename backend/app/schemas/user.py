from pydantic import BaseModel, EmailStr, UUID4, ConfigDict
from typing import Optional, List
from datetime import datetime

class RoleBase(BaseModel):
    name: str

class Role(RoleBase):
    id: UUID4

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_name: str = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: UUID4
    is_active: bool
    is_verified: bool
    roles: List[Role] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
