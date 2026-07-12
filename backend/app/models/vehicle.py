from sqlalchemy import Column, Integer, String, Float, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import VehicleStatus, VehicleType


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    type = Column(SAEnum(VehicleType), nullable=False)
    max_load_capacity = Column(Float, nullable=False)  # in kg
    odometer = Column(Float, default=0.0)              # in km
    acquisition_cost = Column(Float, nullable=False)   # in currency
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE, nullable=False)
    region = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
