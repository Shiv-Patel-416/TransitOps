from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.vehicles import router as vehicles_router
from app.routers.drivers import router as drivers_router
from app.routers.trips import router as trips_router
from app.routers.maintenance import router as maintenance_router
from app.routers.fuel_expenses import fuel_router, expense_router
from app.routers.dashboard_reports import dashboard_router, reports_router

# Import all models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TransitOps API",
    description="End-to-end transport operations platform",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(trips_router)
app.include_router(maintenance_router)
app.include_router(fuel_router)
app.include_router(expense_router)
app.include_router(dashboard_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {"message": "TransitOps API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
