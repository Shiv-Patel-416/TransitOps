from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.fuel_log import FuelLog
from app.models.expense import Expense
from app.models.vehicle import Vehicle
from app.schemas.fuel_expense import FuelLogCreate, FuelLogOut, ExpenseCreate, ExpenseOut
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

fuel_router = APIRouter(prefix="/api/fuel", tags=["fuel"])
expense_router = APIRouter(prefix="/api/expenses", tags=["expenses"])

@fuel_router.get("/", response_model=List[FuelLogOut])
def list_fuel_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "finance:read")
    return db.query(FuelLog).all()

@fuel_router.post("/", response_model=FuelLogOut, status_code=201)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "finance:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    log = FuelLog(**log_in.model_dump(), created_by_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@expense_router.get("/", response_model=List[ExpenseOut])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "finance:read")
    return db.query(Expense).all()

@expense_router.post("/", response_model=ExpenseOut, status_code=201)
def create_expense(
    exp_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "finance:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == exp_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    exp = Expense(**exp_in.model_dump(), created_by_id=current_user.id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp
