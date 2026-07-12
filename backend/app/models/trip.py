from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import TripStatus


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)         # in kg
    planned_distance = Column(Float, nullable=False)     # in km
    actual_distance = Column(Float, nullable=True)       # set on completion
    fuel_consumed = Column(Float, nullable=True)         # liters, set on completion
    revenue = Column(Float, nullable=True)               # set on completion (for ROI)
    status = Column(SAEnum(TripStatus), default=TripStatus.DRAFT, nullable=False)

    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    creator = relationship("User", back_populates="created_trips", foreign_keys=[created_by_id])
    fuel_logs = relationship("FuelLog", back_populates="trip")
