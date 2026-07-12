from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import TripStatus


class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float


class TripCreate(TripBase):
    pass


class TripComplete(BaseModel):
    actual_distance: float
    fuel_consumed: float
    revenue: Optional[float] = None


class TripOut(TripBase):
    id: int
    status: TripStatus
    actual_distance: Optional[float] = None
    fuel_consumed: Optional[float] = None
    revenue: Optional[float] = None
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
