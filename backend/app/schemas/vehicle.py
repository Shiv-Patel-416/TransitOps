from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import VehicleStatus, VehicleType


class VehicleBase(BaseModel):
    registration_number: str
    name: str
    model: str
    type: VehicleType
    max_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float
    region: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    type: Optional[VehicleType] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[VehicleStatus] = None
    region: Optional[str] = None


class VehicleOut(VehicleBase):
    id: int
    status: VehicleStatus
    created_at: datetime

    class Config:
        from_attributes = True
