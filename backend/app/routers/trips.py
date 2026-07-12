from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from app.database import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.enums import TripStatus, VehicleStatus, DriverStatus
from app.schemas.trip import TripCreate, TripOut, TripComplete
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rbac import require_permission

router = APIRouter(prefix="/api/trips", tags=["trips"])


def _validate_dispatch(vehicle: Vehicle, driver: Driver, cargo_weight: float):
    """Enforce all mandatory business rules before dispatch."""
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle '{vehicle.registration_number}' is not available (status: {vehicle.status.value})",
        )
    if driver.status != DriverStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Driver '{driver.name}' is not available (status: {driver.status.value})",
        )
    if driver.status == DriverStatus.SUSPENDED:
        raise HTTPException(status_code=400, detail=f"Driver '{driver.name}' is suspended")
    if driver.license_expiry_date < date.today():
        raise HTTPException(
            status_code=400,
            detail=f"Driver '{driver.name}' has an expired license (expired: {driver.license_expiry_date})",
        )
    if cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight {cargo_weight} kg exceeds vehicle max capacity {vehicle.max_load_capacity} kg",
        )


@router.get("", response_model=List[TripOut])
def list_trips(
    status: TripStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:read")
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    return query.all()


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:read")
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("", response_model=TripOut, status_code=201)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:write")
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    driver = db.query(Driver).filter(Driver.id == trip_in.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Validate business rules
    _validate_dispatch(vehicle, driver, trip_in.cargo_weight)

    trip = Trip(
        **trip_in.model_dump(),
        status=TripStatus.DRAFT,
        created_by_id=current_user.id,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/dispatch", response_model=TripOut)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:write")
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != TripStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Cannot dispatch a trip in status '{trip.status.value}'")

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()

    # Re-validate at dispatch time
    _validate_dispatch(vehicle, driver, trip.cargo_weight)

    # Atomic status transition
    trip.status = TripStatus.DISPATCHED
    trip.dispatched_at = datetime.utcnow()
    vehicle.status = VehicleStatus.ON_TRIP
    driver.status = DriverStatus.ON_TRIP

    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/complete", response_model=TripOut)
def complete_trip(
    trip_id: int,
    completion: TripComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:write")
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != TripStatus.DISPATCHED:
        raise HTTPException(status_code=400, detail="Only dispatched trips can be completed")

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()

    # Update trip
    trip.status = TripStatus.COMPLETED
    trip.completed_at = datetime.utcnow()
    trip.actual_distance = completion.actual_distance
    trip.fuel_consumed = completion.fuel_consumed
    trip.revenue = completion.revenue

    # Update odometer
    vehicle.odometer += completion.actual_distance

    # Restore statuses
    vehicle.status = VehicleStatus.AVAILABLE
    driver.status = DriverStatus.AVAILABLE

    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/cancel", response_model=TripOut)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_permission(current_user.role, "trips:write")
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status not in (TripStatus.DRAFT, TripStatus.DISPATCHED):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a trip in status '{trip.status.value}'")

    if trip.status == TripStatus.DISPATCHED:
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        vehicle.status = VehicleStatus.AVAILABLE
        driver.status = DriverStatus.AVAILABLE

    trip.status = TripStatus.CANCELLED
    trip.cancelled_at = datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip

