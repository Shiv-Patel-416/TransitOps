from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.enums import DriverStatus


class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float = 100.0


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[DriverStatus] = None


class DriverOut(DriverBase):
    id: int
    status: DriverStatus
    is_license_expired: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DriverOutWithExpiry(DriverOut):
    is_license_expired: bool
