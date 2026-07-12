from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.enums import VehicleStatus
from app.schemas.vehicle import VehicleCreate, VehicleOut, VehicleUpdate
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("/", response_model=List[VehicleOut])
def list_vehicles(
    status: VehicleStatus = None,
    type: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:read")
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if type:
        query = query.filter(Vehicle.type == type)
    if region:
        query = query.filter(Vehicle.region == region)
    return query.all()


@router.get("/available", response_model=List[VehicleOut])
def list_available_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns only AVAILABLE vehicles for dispatch selection."""
    require_permission(current_user.role, "vehicles:read")
    return db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).all()


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:read")
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("/", response_model=VehicleOut, status_code=201)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:write")
    existing = db.query(Vehicle).filter(
        Vehicle.registration_number == vehicle_in.registration_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle with registration '{vehicle_in.registration_number}' already exists",
        )
    vehicle = Vehicle(**vehicle_in.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in vehicle_in.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:delete")
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()


@router.get("/{vehicle_id}/operational-cost")
def get_operational_cost(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "vehicles:read")
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    from app.models.fuel_log import FuelLog
    from app.models.maintenance_log import MaintenanceLog
    from sqlalchemy import func

    fuel_cost = db.query(func.sum(FuelLog.cost)).filter(FuelLog.vehicle_id == vehicle_id).scalar() or 0.0
    maintenance_cost = db.query(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.vehicle_id == vehicle_id).scalar() or 0.0

    return {
        "vehicle_id": vehicle_id,
        "fuel_cost": fuel_cost,
        "maintenance_cost": maintenance_cost,
        "total_cost": fuel_cost + maintenance_cost
    }
