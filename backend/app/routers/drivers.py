from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models.driver import Driver
from app.models.enums import DriverStatus
from app.schemas.driver import DriverCreate, DriverOut, DriverUpdate
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

router = APIRouter(prefix="/api/drivers", tags=["drivers"])


def _enrich_driver(driver: Driver) -> dict:
    """Add computed is_license_expired field."""
    data = {c.name: getattr(driver, c.name) for c in driver.__table__.columns}
    data["is_license_expired"] = driver.license_expiry_date < date.today()
    return data


@router.get("", response_model=List[DriverOut])
def list_drivers(
    status: DriverStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "drivers:read")
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status)
    drivers = query.all()
    return [_enrich_driver(d) for d in drivers]


@router.get("/available", response_model=List[DriverOut])
def list_available_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns only eligible drivers: AVAILABLE + license not expired + not SUSPENDED."""
    require_permission(current_user.role, "drivers:read")
    drivers = db.query(Driver).filter(
        Driver.status == DriverStatus.AVAILABLE,
        Driver.license_expiry_date >= date.today(),
    ).all()
    return [_enrich_driver(d) for d in drivers]


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "drivers:read")
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return _enrich_driver(driver)


@router.post("", response_model=DriverOut, status_code=201)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "drivers:write")
    existing = db.query(Driver).filter(Driver.license_number == driver_in.license_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="License number already exists")
    driver = Driver(**driver_in.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return _enrich_driver(driver)


@router.put("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: int,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "drivers:write")
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    for field, value in driver_in.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return _enrich_driver(driver)


@router.delete("/{driver_id}", status_code=204)
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "drivers:delete")
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(driver)
    db.commit()

