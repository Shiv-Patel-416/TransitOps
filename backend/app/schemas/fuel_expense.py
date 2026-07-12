from pydantic import BaseModel
from typing import Optional, Union
from datetime import date as dt_date, datetime
from app.models.enums import ExpenseCategory

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float
    cost: float

class FuelLogCreate(FuelLogBase):
    date: Optional[dt_date] = None

class FuelLogOut(FuelLogBase):
    id: int
    date: Optional[dt_date] = None
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    vehicle_id: int
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    date: Optional[dt_date] = None

class ExpenseOut(ExpenseBase):
    id: int
    date: Optional[dt_date] = None
    created_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True
