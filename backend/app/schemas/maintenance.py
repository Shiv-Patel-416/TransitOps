from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import MaintenanceStatus

class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    description: str
    maintenance_type: str
    cost: Optional[float] = 0.0

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    description: Optional[str] = None
    maintenance_type: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[MaintenanceStatus] = None

class MaintenanceLogOut(MaintenanceLogBase):
    id: int
    status: MaintenanceStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
