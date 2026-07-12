from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance_log import MaintenanceLog
from app.models.fuel_log import FuelLog
from app.models.expense import Expense
from app.models.enums import VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
reports_router = APIRouter(prefix="/api/reports", tags=["reports"])

@dashboard_router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Everyone can read dashboard
    active_vehicles = db.query(Vehicle).filter(Vehicle.status != VehicleStatus.RETIRED).count()
    drivers_on_duty = db.query(Driver).filter(Driver.status == DriverStatus.ON_TRIP).count()
    
    # We can just count trips that are not cancelled
    trips_today = db.query(Trip).filter(Trip.status != TripStatus.CANCELLED).count()
    
    pending_maintenance = db.query(MaintenanceLog).filter(MaintenanceLog.status == MaintenanceStatus.OPEN).count()
    
    monthly_fuel_cost = db.query(func.sum(FuelLog.cost)).scalar() or 0.0
    
    utilization = 0
    if active_vehicles > 0:
        on_trip_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.ON_TRIP).count()
        utilization = (on_trip_vehicles / active_vehicles) * 100
        
    return {
        "active_vehicles": active_vehicles,
        "drivers_on_duty": drivers_on_duty,
        "trips_today": trips_today,
        "pending_maintenance": pending_maintenance,
        "monthly_fuel_cost": monthly_fuel_cost,
        "fleet_utilization": round(utilization, 1)
    }

@reports_router.get("/expenses-summary")
def get_expenses_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expenses_by_category = db.query(
        Expense.category, func.sum(Expense.amount).label("total")
    ).group_by(Expense.category).all()
    
    return [{"category": e[0].value, "total": e[1]} for e in expenses_by_category]
