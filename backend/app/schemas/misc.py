from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import MaintenanceStatus


class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    description: str
    maintenance_type: str
    cost: float = 0.0


class MaintenanceLogCreate(MaintenanceLogBase):
    pass


class MaintenanceLogClose(BaseModel):
    cost: Optional[float] = None


class MaintenanceLogOut(MaintenanceLogBase):
    id: int
    status: MaintenanceStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True


# ─── Fuel Log ───────────────────────────────────────────────────────────────

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float
    cost: float
    date: Optional[str] = None


class FuelLogCreate(FuelLogBase):
    pass


class FuelLogOut(FuelLogBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True


# ─── Expense ────────────────────────────────────────────────────────────────

from app.models.enums import ExpenseCategory


class ExpenseBase(BaseModel):
    vehicle_id: int
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    date: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
