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


# â”€â”€â”€ Fuel Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@fuel_router.get("", response_model=List[FuelLogOut])
def list_fuel_logs(
    vehicle_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "fuel:read")
    query = db.query(FuelLog)
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    return query.order_by(FuelLog.created_at.desc()).all()


@fuel_router.get("/{log_id}", response_model=FuelLogOut)
def get_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "fuel:read")
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return log


@fuel_router.post("", response_model=FuelLogOut, status_code=201)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "fuel:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    log = FuelLog(**log_in.model_dump(), created_by_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@fuel_router.delete("/{log_id}")
def delete_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "fuel:write")
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    db.delete(log)
    db.commit()
    return {"message": "Fuel log deleted"}


# â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@expense_router.get("", response_model=List[ExpenseOut])
def list_expenses(
    category: str = None,
    vehicle_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "expenses:read")
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    return query.order_by(Expense.created_at.desc()).all()


@expense_router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "expenses:read")
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    return exp


@expense_router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(
    exp_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "expenses:write")
    if exp_in.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == exp_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

    exp = Expense(**exp_in.model_dump(), created_by_id=current_user.id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@expense_router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    exp_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "expenses:write")
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = exp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)

    db.commit()
    db.refresh(exp)
    return exp


@expense_router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "expenses:delete")
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted"}

