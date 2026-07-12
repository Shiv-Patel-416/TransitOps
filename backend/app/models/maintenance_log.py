from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import MaintenanceStatus


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(String, nullable=False)
    maintenance_type = Column(String, nullable=False)  # e.g., Oil Change, Tire, Engine
    cost = Column(Float, default=0.0)
    status = Column(SAEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN, nullable=False)
    opened_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
    creator = relationship("User", back_populates="created_maintenance")
