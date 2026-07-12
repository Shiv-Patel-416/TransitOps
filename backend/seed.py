"""
Seed script for TransitOps demo data.
Creates 4 users (one per role), 5 vehicles, 5 drivers.
Includes edge cases: expired license, suspended driver.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date, timedelta
from app.database import SessionLocal, engine, Base
from app.models import User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
from app.models.enums import (
    Role, VehicleStatus, VehicleType,
    DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory
)
from app.core.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("[*] Seeding TransitOps database...")

# ─── Clean slate ────────────────────────────────────────────────────────────
for model in [Expense, FuelLog, MaintenanceLog, Trip, Driver, Vehicle, User]:
    db.query(model).delete()
db.commit()

# ─── Users (one per role) ───────────────────────────────────────────────────
users = [
    User(
        name="Fleet Manager",
        email="fleet@transitops.com",
        hashed_password=get_password_hash("fleet123"),
        role=Role.FLEET_MANAGER,
    ),
    User(
        name="Alex Driver",
        email="driver@transitops.com",
        hashed_password=get_password_hash("driver123"),
        role=Role.DRIVER,
    ),
    User(
        name="Safety Officer",
        email="safety@transitops.com",
        hashed_password=get_password_hash("safety123"),
        role=Role.SAFETY_OFFICER,
    ),
    User(
        name="Financial Analyst",
        email="finance@transitops.com",
        hashed_password=get_password_hash("finance123"),
        role=Role.FINANCIAL_ANALYST,
    ),
]
db.add_all(users)
db.commit()
for u in users:
    db.refresh(u)
print(f"  [+] Created {len(users)} users")

# ─── Vehicles ───────────────────────────────────────────────────────────────
vehicles = [
    Vehicle(
        registration_number="VAN-01",
        name="Van-01",
        model="Transit Connect",
        type=VehicleType.VAN,
        max_load_capacity=500.0,
        odometer=12500.0,
        acquisition_cost=35000.0,
        status=VehicleStatus.AVAILABLE,
        region="North",
    ),
    Vehicle(
        registration_number="TRK-02",
        name="Truck-02",
        model="Volvo FH",
        type=VehicleType.TRUCK,
        max_load_capacity=5000.0,
        odometer=87200.0,
        acquisition_cost=120000.0,
        status=VehicleStatus.AVAILABLE,
        region="South",
    ),
    Vehicle(
        registration_number="BUS-03",
        name="Bus-03",
        model="Mercedes Sprinter",
        type=VehicleType.BUS,
        max_load_capacity=2000.0,
        odometer=45000.0,
        acquisition_cost=80000.0,
        status=VehicleStatus.AVAILABLE,
        region="East",
    ),
    Vehicle(
        # IN_SHOP — for demo: judges expect this to NOT appear in dispatch pool
        registration_number="VAN-04",
        name="Van-04",
        model="Ford Transit",
        type=VehicleType.VAN,
        max_load_capacity=600.0,
        odometer=31000.0,
        acquisition_cost=38000.0,
        status=VehicleStatus.IN_SHOP,
        region="West",
    ),
    Vehicle(
        # RETIRED — should never appear in dispatch
        registration_number="CAR-05",
        name="Car-05",
        model="Toyota Hiace",
        type=VehicleType.CAR,
        max_load_capacity=300.0,
        odometer=195000.0,
        acquisition_cost=25000.0,
        status=VehicleStatus.RETIRED,
        region="North",
    ),
]
db.add_all(vehicles)
db.commit()
for v in vehicles:
    db.refresh(v)
print(f"  [+] Created {len(vehicles)} vehicles (1 IN_SHOP, 1 RETIRED)")

# ─── Drivers ────────────────────────────────────────────────────────────────
today = date.today()
drivers = [
    Driver(
        name="Alex Johnson",
        license_number="DL-ALEX-001",
        license_category="C",
        license_expiry_date=today + timedelta(days=365),
        contact_number="+1-555-0101",
        safety_score=98.5,
        status=DriverStatus.AVAILABLE,
    ),
    Driver(
        name="Maria Garcia",
        license_number="DL-MARIA-002",
        license_category="B",
        license_expiry_date=today + timedelta(days=180),
        contact_number="+1-555-0102",
        safety_score=95.0,
        status=DriverStatus.AVAILABLE,
    ),
    Driver(
        name="James Wilson",
        license_number="DL-JAMES-003",
        license_category="A",
        license_expiry_date=today + timedelta(days=730),
        contact_number="+1-555-0103",
        safety_score=92.0,
        status=DriverStatus.AVAILABLE,
    ),
    Driver(
        # EXPIRED LICENSE — should never appear in dispatch pool (demo edge case)
        name="David Brown",
        license_number="DL-DAVID-004",
        license_category="B",
        license_expiry_date=today - timedelta(days=30),  # 30 days ago
        contact_number="+1-555-0104",
        safety_score=78.0,
        status=DriverStatus.AVAILABLE,
    ),
    Driver(
        # SUSPENDED — should never appear in dispatch pool (demo edge case)
        name="Emma Davis",
        license_number="DL-EMMA-005",
        license_category="C",
        license_expiry_date=today + timedelta(days=200),
        contact_number="+1-555-0105",
        safety_score=45.0,
        status=DriverStatus.SUSPENDED,
    ),
]
db.add_all(drivers)
db.commit()
for d in drivers:
    db.refresh(d)
print(f"  [+] Created {len(drivers)} drivers (1 expired license, 1 suspended)")

# ─── Sample completed trip for reports ─────────────────────────────────────
sample_trip = Trip(
    source="Warehouse A",
    destination="Depot B",
    vehicle_id=vehicles[1].id,  # Truck-02
    driver_id=drivers[0].id,    # Alex Johnson
    cargo_weight=3200.0,
    planned_distance=450.0,
    actual_distance=462.0,
    fuel_consumed=55.0,
    revenue=8500.0,
    status=TripStatus.COMPLETED,
    created_by_id=users[0].id,
)
db.add(sample_trip)
db.commit()
db.refresh(sample_trip)

# Sample fuel log
fuel_log = FuelLog(
    vehicle_id=vehicles[1].id,
    trip_id=sample_trip.id,
    liters=55.0,
    cost=82.5,
    date=today,
    created_by_id=users[0].id,
)
db.add(fuel_log)

# Sample expense
expense = Expense(
    vehicle_id=vehicles[1].id,
    category=ExpenseCategory.TOLL,
    amount=25.0,
    description="Highway toll - Route 66",
    date=today,
    created_by_id=users[0].id,
)
db.add(expense)

# Maintenance log for VAN-04
maintenance = MaintenanceLog(
    vehicle_id=vehicles[3].id,  # Van-04 (already IN_SHOP)
    description="Brake pad replacement + oil change",
    maintenance_type="Brake & Oil Service",
    cost=350.0,
    status=MaintenanceStatus.OPEN,
    created_by_id=users[0].id,
)
db.add(maintenance)
db.commit()

print("  [+] Created sample trip, fuel log, expense, and maintenance record")
print()
print("--- Demo Credentials ---")
print("  Fleet Manager  : fleet@transitops.com   / fleet123")
print("  Driver         : driver@transitops.com  / driver123")
print("  Safety Officer : safety@transitops.com  / safety123")
print("  Finance        : finance@transitops.com / finance123")
print("------------------------")
print("[OK] Seed complete!")

db.close()
