from sqlalchemy import Column, Integer, String, Float, Date, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import DriverStatus


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)   # e.g., A, B, C, D
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Float, default=100.0)         # 0–100
    status = Column(SAEnum(DriverStatus), default=DriverStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trips = relationship("Trip", back_populates="driver")
