from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Enum as SAEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import ExpenseCategory


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    category = Column(SAEnum(ExpenseCategory), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="expenses")
    creator = relationship("User", back_populates="created_expenses")
