import enum


class Role(str, enum.Enum):
    FLEET_MANAGER = "FLEET_MANAGER"
    DRIVER = "DRIVER"
    SAFETY_OFFICER = "SAFETY_OFFICER"
    FINANCIAL_ANALYST = "FINANCIAL_ANALYST"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETIRED = "RETIRED"


class VehicleType(str, enum.Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    BUS = "BUS"
    CAR = "CAR"
    MOTORCYCLE = "MOTORCYCLE"


class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    SUSPENDED = "SUSPENDED"


class TripStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MaintenanceStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class ExpenseCategory(str, enum.Enum):
    FUEL = "FUEL"
    MAINTENANCE = "MAINTENANCE"
    TOLL = "TOLL"
    INSURANCE = "INSURANCE"
    OTHER = "OTHER"
