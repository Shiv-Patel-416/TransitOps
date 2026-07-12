from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.maintenance_log import MaintenanceLog
from app.models.vehicle import Vehicle
from app.models.enums import MaintenanceStatus, VehicleStatus
from app.schemas.maintenance import MaintenanceLogCreate, MaintenanceLogUpdate, MaintenanceLogOut
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])

@router.get("/", response_model=List[MaintenanceLogOut])
def list_maintenance_logs(
    status: MaintenanceStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "maintenance:read")
    query = db.query(MaintenanceLog)
    if status:
        query = query.filter(MaintenanceLog.status == status)
    return query.all()

@router.post("/", response_model=MaintenanceLogOut, status_code=201)
def create_maintenance_log(
    log_in: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "maintenance:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    log = MaintenanceLog(
        **log_in.model_dump(),
        status=MaintenanceStatus.OPEN,
        created_by_id=current_user.id,
    )
    db.add(log)
    
    # Optionally update vehicle status to MAINTENANCE
    vehicle.status = VehicleStatus.MAINTENANCE
    
    db.commit()
    db.refresh(log)
    return log

@router.put("/{log_id}", response_model=MaintenanceLogOut)
def update_maintenance_log(
    log_id: int,
    log_update: MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "maintenance:write")
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    update_data = log_update.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] == MaintenanceStatus.CLOSED and log.status != MaintenanceStatus.CLOSED:
        log.closed_at = datetime.utcnow()
        vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
        if vehicle and vehicle.status == VehicleStatus.MAINTENANCE:
            vehicle.status = VehicleStatus.AVAILABLE

    for field, value in update_data.items():
        setattr(log, field, value)

    db.commit()
    db.refresh(log)
    return log
