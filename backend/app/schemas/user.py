from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.enums import Role


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Role


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
