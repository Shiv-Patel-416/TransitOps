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
def get_kpis(
    type: str = None,
    status: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Base queries
    v_query = db.query(Vehicle)
    t_query = db.query(Trip)
    d_query = db.query(Driver)
    m_query = db.query(MaintenanceLog)
    f_query = db.query(FuelLog)
    
    if type:
        v_query = v_query.filter(Vehicle.type == type)
        t_query = t_query.join(Vehicle).filter(Vehicle.type == type)
        m_query = m_query.join(Vehicle).filter(Vehicle.type == type)
        f_query = f_query.join(Vehicle).filter(Vehicle.type == type)
    if status:
        v_query = v_query.filter(Vehicle.status == status)
        t_query = t_query.join(Vehicle).filter(Vehicle.status == status)
        m_query = m_query.join(Vehicle).filter(Vehicle.status == status)
        f_query = f_query.join(Vehicle).filter(Vehicle.status == status)
    if region:
        v_query = v_query.filter(Vehicle.region == region)
        t_query = t_query.join(Vehicle).filter(Vehicle.region == region)
        m_query = m_query.join(Vehicle).filter(Vehicle.region == region)
        f_query = f_query.join(Vehicle).filter(Vehicle.region == region)

    active_vehicles = v_query.filter(Vehicle.status != VehicleStatus.RETIRED).count()
    
    if type or status or region:
        drivers_on_duty = db.query(Driver).join(Trip).join(Vehicle).filter(
            Driver.status == DriverStatus.ON_TRIP
        )
        if type: drivers_on_duty = drivers_on_duty.filter(Vehicle.type == type)
        if status: drivers_on_duty = drivers_on_duty.filter(Vehicle.status == status)
        if region: drivers_on_duty = drivers_on_duty.filter(Vehicle.region == region)
        drivers_on_duty = drivers_on_duty.count()
    else:
        drivers_on_duty = db.query(Driver).filter(Driver.status == DriverStatus.ON_TRIP).count()
        
    trips_today = t_query.filter(Trip.status != TripStatus.CANCELLED).count()
    pending_maintenance = m_query.filter(MaintenanceLog.status == MaintenanceStatus.OPEN).count()
    
    monthly_fuel_cost = f_query.with_entities(func.sum(FuelLog.cost)).scalar() or 0.0
    
    utilization = 0
    if active_vehicles > 0:
        on_trip_vehicles = v_query.filter(Vehicle.status == VehicleStatus.ON_TRIP).count()
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

@reports_router.get("/vehicles-summary")
def get_vehicles_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicles = db.query(Vehicle).all()
    result = []
    
    for v in vehicles:
        # Sum fuel logs
        fuel_cost = db.query(func.sum(FuelLog.cost)).filter(FuelLog.vehicle_id == v.id).scalar() or 0.0
        fuel_liters = db.query(func.sum(FuelLog.liters)).filter(FuelLog.vehicle_id == v.id).scalar() or 0.0
        
        # Sum maintenance logs
        maintenance_cost = db.query(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.vehicle_id == v.id).scalar() or 0.0
        
        # Sum general expenses
        other_expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.vehicle_id == v.id, Expense.category != "FUEL"
        ).scalar() or 0.0
        
        # Trips info
        trips = db.query(Trip).filter(Trip.vehicle_id == v.id, Trip.status == TripStatus.COMPLETED).all()
        total_distance = sum(t.actual_distance for t in trips)
        total_revenue = sum(t.revenue for t in trips if t.revenue)
        
        total_ops_cost = fuel_cost + maintenance_cost + other_expenses
        
        # ROI calculation
        roi = 0.0
        if v.acquisition_cost > 0:
            roi = (total_revenue - total_ops_cost) / v.acquisition_cost
            
        result.append({
            "id": v.id,
            "registration_number": v.registration_number,
            "name": v.name,
            "type": v.type.value,
            "region": v.region,
            "acquisition_cost": v.acquisition_cost,
            "total_trips": len(trips),
            "total_distance": total_distance,
            "total_fuel_liters": fuel_liters,
            "fuel_cost": fuel_cost,
            "maintenance_cost": maintenance_cost,
            "other_expenses": other_expenses,
            "total_operational_cost": total_ops_cost,
            "revenue": total_revenue,
            "roi": round(roi, 4)
        })
        
    return result
