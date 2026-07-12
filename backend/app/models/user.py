from sqlalchemy import Column, Integer, String, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import Role


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(Role), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    created_trips = relationship("Trip", back_populates="creator", foreign_keys="Trip.created_by_id")
    created_maintenance = relationship("MaintenanceLog", back_populates="creator")
    created_fuel_logs = relationship("FuelLog", back_populates="creator")
    created_expenses = relationship("Expense", back_populates="creator")
