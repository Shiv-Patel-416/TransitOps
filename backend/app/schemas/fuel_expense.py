from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.enums import ExpenseCategory

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float
    cost: float
    date: Optional[date] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogOut(FuelLogBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    vehicle_id: int
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    date: Optional[date] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
