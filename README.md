# TransitOps

> End-to-end transport operations platform for managing vehicles, drivers, trips, maintenance, and expenses.

---

## Table of Contents

- [Roles & RBAC](#roles--rbac)
- [Enums](#enums)
- [Data Model](#data-model)
- [API Contract](#api-contract)
- [Business Rules](#business-rules)

---

## Roles & RBAC

| Role                 | Slug               | Permissions Summary                                              |
| -------------------- | ------------------- | ---------------------------------------------------------------- |
| Fleet Manager        | `FLEET_MANAGER`     | Full CRUD on vehicles, drivers, trips. Read maintenance/fuel/expenses. Dashboard access. |
| Driver               | `DRIVER`            | View own trips, update trip status (start/complete), log fuel.   |
| Safety Officer       | `SAFETY_OFFICER`    | Read-only vehicles & drivers. CRUD maintenance logs. Flag issues.|
| Financial Analyst    | `FINANCIAL_ANALYST` | Read-only all entities. CRUD expenses. Full reports & analytics. |

---

## Enums

```
Vehicle Status : AVAILABLE | ON_TRIP | IN_SHOP | RETIRED
Driver Status  : AVAILABLE | ON_TRIP | OFF_DUTY | SUSPENDED
Trip Status    : DRAFT | DISPATCHED | COMPLETED | CANCELLED
User Role      : FLEET_MANAGER | DRIVER | SAFETY_OFFICER | FINANCIAL_ANALYST
Fuel Type      : DIESEL | PETROL | CNG | ELECTRIC
Expense Cat.   : FUEL | MAINTENANCE | TOLL | INSURANCE | OTHER
```

---

## Data Model

### ER Overview

```
User 1──1 Driver
Vehicle 1──* Trip
Driver  1──* Trip
Vehicle 1──* MaintenanceLog
Vehicle 1──* FuelLog
Driver  1──* FuelLog
Vehicle 1──* Expense
Trip    1──* Expense
```

---

### User

| Column       | Type         | Constraints                        |
| ------------ | ------------ | ---------------------------------- |
| id           | UUID / PK    | auto-generated                     |
| username     | VARCHAR(100) | UNIQUE, NOT NULL                   |
| email        | VARCHAR(255) | UNIQUE, NOT NULL                   |
| password_hash| TEXT         | NOT NULL                           |
| role         | ENUM(Role)   | NOT NULL                           |
| is_active    | BOOLEAN      | DEFAULT true                       |
| created_at   | TIMESTAMP    | DEFAULT now()                      |
| updated_at   | TIMESTAMP    | DEFAULT now(), auto-update         |

---

### Vehicle

| Column              | Type          | Constraints                       |
| ------------------- | ------------- | --------------------------------- |
| id                  | UUID / PK     | auto-generated                    |
| registration_number | VARCHAR(20)   | UNIQUE, NOT NULL                  |
| make                | VARCHAR(50)   | NOT NULL                          |
| model               | VARCHAR(50)   | NOT NULL                          |
| year                | INTEGER       | NOT NULL                          |
| type                | VARCHAR(30)   | e.g. Truck, Van, Bus              |
| capacity_kg         | DECIMAL(10,2) | NOT NULL                          |
| fuel_type           | ENUM(FuelType)| NOT NULL                          |
| mileage_km          | DECIMAL(12,2) | DEFAULT 0                         |
| status              | ENUM(VehicleStatus) | DEFAULT 'AVAILABLE'          |
| created_at          | TIMESTAMP     | DEFAULT now()                     |
| updated_at          | TIMESTAMP     | DEFAULT now(), auto-update        |

---

### Driver

| Column          | Type          | Constraints                        |
| --------------- | ------------- | ---------------------------------- |
| id              | UUID / PK     | auto-generated                     |
| user_id         | UUID / FK     | → User.id, UNIQUE, NOT NULL        |
| name            | VARCHAR(150)  | NOT NULL                           |
| license_number  | VARCHAR(30)   | UNIQUE, NOT NULL                   |
| license_expiry  | DATE          | NOT NULL                           |
| phone           | VARCHAR(15)   | NOT NULL                           |
| status          | ENUM(DriverStatus) | DEFAULT 'AVAILABLE'            |
| created_at      | TIMESTAMP     | DEFAULT now()                      |
| updated_at      | TIMESTAMP     | DEFAULT now(), auto-update         |

---

### Trip

| Column          | Type          | Constraints                        |
| --------------- | ------------- | ---------------------------------- |
| id              | UUID / PK     | auto-generated                     |
| vehicle_id      | UUID / FK     | → Vehicle.id, NOT NULL             |
| driver_id       | UUID / FK     | → Driver.id, NOT NULL              |
| status          | ENUM(TripStatus) | DEFAULT 'DRAFT'                 |
| origin          | VARCHAR(255)  | NOT NULL                           |
| destination     | VARCHAR(255)  | NOT NULL                           |
| scheduled_start | TIMESTAMP     | NOT NULL                           |
| scheduled_end   | TIMESTAMP     | nullable                           |
| actual_start    | TIMESTAMP     | nullable                           |
| actual_end      | TIMESTAMP     | nullable                           |
| cargo_weight_kg | DECIMAL(10,2) | nullable                           |
| distance_km     | DECIMAL(10,2) | nullable                           |
| notes           | TEXT          | nullable                           |
| created_at      | TIMESTAMP     | DEFAULT now()                      |
| updated_at      | TIMESTAMP     | DEFAULT now(), auto-update         |

---

### MaintenanceLog

| Column           | Type          | Constraints                       |
| ---------------- | ------------- | --------------------------------- |
| id               | UUID / PK     | auto-generated                    |
| vehicle_id       | UUID / FK     | → Vehicle.id, NOT NULL            |
| description      | TEXT          | NOT NULL                          |
| cost             | DECIMAL(12,2) | NOT NULL                          |
| date             | DATE          | NOT NULL                          |
| odometer_reading | DECIMAL(12,2) | nullable                          |
| performed_by     | VARCHAR(150)  | nullable                          |
| next_due_date    | DATE          | nullable                          |
| created_at       | TIMESTAMP     | DEFAULT now()                     |
| updated_at       | TIMESTAMP     | DEFAULT now(), auto-update        |

---

### FuelLog

| Column           | Type          | Constraints                       |
| ---------------- | ------------- | --------------------------------- |
| id               | UUID / PK     | auto-generated                    |
| vehicle_id       | UUID / FK     | → Vehicle.id, NOT NULL            |
| driver_id        | UUID / FK     | → Driver.id, NOT NULL             |
| fuel_type        | ENUM(FuelType)| NOT NULL                          |
| quantity_liters  | DECIMAL(10,2) | NOT NULL                          |
| cost             | DECIMAL(12,2) | NOT NULL                          |
| odometer_reading | DECIMAL(12,2) | NOT NULL                          |
| date             | DATE          | NOT NULL                          |
| created_at       | TIMESTAMP     | DEFAULT now()                     |
| updated_at       | TIMESTAMP     | DEFAULT now(), auto-update        |

---

### Expense

| Column      | Type            | Constraints                         |
| ----------- | --------------- | ----------------------------------- |
| id          | UUID / PK       | auto-generated                      |
| vehicle_id  | UUID / FK       | → Vehicle.id, nullable              |
| trip_id     | UUID / FK       | → Trip.id, nullable                 |
| category    | ENUM(ExpenseCat)| NOT NULL                            |
| amount      | DECIMAL(12,2)   | NOT NULL                            |
| description | TEXT            | nullable                            |
| date        | DATE            | NOT NULL                            |
| created_by  | UUID / FK       | → User.id, NOT NULL                 |
| created_at  | TIMESTAMP       | DEFAULT now()                       |
| updated_at  | TIMESTAMP       | DEFAULT now(), auto-update          |

---

## API Contract

> Base URL: `/api/v1`  
> All endpoints return JSON.  
> Auth: Bearer JWT token in `Authorization` header.  
> Standard error shape: `{ "error": { "code": "string", "message": "string" } }`

---

### Auth

| Method | Endpoint             | Body                                         | Response (200/201)                              | Roles       |
| ------ | -------------------- | -------------------------------------------- | ----------------------------------------------- | ----------- |
| POST   | `/auth/register`     | `{ username, email, password, role }`        | `{ user, token }`                               | Public      |
| POST   | `/auth/login`        | `{ email, password }`                        | `{ user, token }`                               | Public      |
| GET    | `/auth/me`           | —                                            | `{ user }`                                      | Any authed  |

---

### Vehicles

| Method | Endpoint              | Body / Params                                | Response                                        | Roles               |
| ------ | --------------------- | -------------------------------------------- | ----------------------------------------------- | -------------------- |
| GET    | `/vehicles`           | `?status=&page=&limit=`                      | `{ data: Vehicle[], total, page, limit }`       | All authed           |
| GET    | `/vehicles/:id`       | —                                            | `{ data: Vehicle }`                             | All authed           |
| POST   | `/vehicles`           | `{ registration_number, make, model, year, type, capacity_kg, fuel_type }` | `{ data: Vehicle }` | FLEET_MANAGER        |
| PUT    | `/vehicles/:id`       | partial Vehicle fields                       | `{ data: Vehicle }`                             | FLEET_MANAGER        |
| DELETE | `/vehicles/:id`       | —                                            | `{ message }`                                   | FLEET_MANAGER        |

---

### Drivers

| Method | Endpoint              | Body / Params                                | Response                                        | Roles               |
| ------ | --------------------- | -------------------------------------------- | ----------------------------------------------- | -------------------- |
| GET    | `/drivers`            | `?status=&page=&limit=`                      | `{ data: Driver[], total, page, limit }`        | All authed           |
| GET    | `/drivers/:id`        | —                                            | `{ data: Driver }`                              | All authed           |
| POST   | `/drivers`            | `{ user_id, name, license_number, license_expiry, phone }` | `{ data: Driver }`     | FLEET_MANAGER        |
| PUT    | `/drivers/:id`        | partial Driver fields                        | `{ data: Driver }`                              | FLEET_MANAGER        |
| DELETE | `/drivers/:id`        | —                                            | `{ message }`                                   | FLEET_MANAGER        |

---

### Trips

| Method | Endpoint                   | Body / Params                                                  | Response                 | Roles               |
| ------ | -------------------------- | -------------------------------------------------------------- | ------------------------ | -------------------- |
| GET    | `/trips`                   | `?status=&driver_id=&vehicle_id=&page=&limit=`                | `{ data: Trip[], … }`   | All authed           |
| GET    | `/trips/:id`               | —                                                              | `{ data: Trip }`         | All authed           |
| POST   | `/trips`                   | `{ vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end?, cargo_weight_kg? }` | `{ data: Trip }` | FLEET_MANAGER |
| PUT    | `/trips/:id`               | partial Trip fields                                            | `{ data: Trip }`         | FLEET_MANAGER        |
| PATCH  | `/trips/:id/dispatch`      | —                                                              | `{ data: Trip }`         | FLEET_MANAGER        |
| PATCH  | `/trips/:id/start`         | —                                                              | `{ data: Trip }`         | DRIVER               |
| PATCH  | `/trips/:id/complete`      | `{ distance_km? }`                                             | `{ data: Trip }`         | DRIVER               |
| PATCH  | `/trips/:id/cancel`        | `{ notes? }`                                                   | `{ data: Trip }`         | FLEET_MANAGER        |

#### Trip Status Transitions

```
DRAFT → DISPATCHED → COMPLETED
  │         │
  └→ CANCELLED ←┘
```

- **DRAFT → DISPATCHED**: Sets `vehicle.status = ON_TRIP`, `driver.status = ON_TRIP`.
- **DISPATCHED → COMPLETED**: Sets `vehicle.status = AVAILABLE`, `driver.status = AVAILABLE`, records `actual_end`.
- **DRAFT/DISPATCHED → CANCELLED**: Restores vehicle & driver to `AVAILABLE` (if they were ON_TRIP).

---

### Maintenance Logs

| Method | Endpoint                    | Body / Params                                                   | Response                     | Roles                         |
| ------ | --------------------------- | --------------------------------------------------------------- | ---------------------------- | ----------------------------- |
| GET    | `/maintenance`              | `?vehicle_id=&page=&limit=`                                    | `{ data: MaintenanceLog[], … }` | All authed                 |
| GET    | `/maintenance/:id`          | —                                                               | `{ data: MaintenanceLog }`   | All authed                    |
| POST   | `/maintenance`              | `{ vehicle_id, description, cost, date, odometer_reading?, performed_by?, next_due_date? }` | `{ data: MaintenanceLog }` | FLEET_MANAGER, SAFETY_OFFICER |
| PUT    | `/maintenance/:id`          | partial fields                                                  | `{ data: MaintenanceLog }`   | FLEET_MANAGER, SAFETY_OFFICER |
| DELETE | `/maintenance/:id`          | —                                                               | `{ message }`                | FLEET_MANAGER                 |

---

### Fuel Logs

| Method | Endpoint                | Body / Params                                                            | Response                  | Roles                   |
| ------ | ----------------------- | ------------------------------------------------------------------------ | ------------------------- | ----------------------- |
| GET    | `/fuel-logs`            | `?vehicle_id=&driver_id=&page=&limit=`                                  | `{ data: FuelLog[], … }` | All authed              |
| GET    | `/fuel-logs/:id`        | —                                                                        | `{ data: FuelLog }`       | All authed              |
| POST   | `/fuel-logs`            | `{ vehicle_id, driver_id, fuel_type, quantity_liters, cost, odometer_reading, date }` | `{ data: FuelLog }` | FLEET_MANAGER, DRIVER |
| PUT    | `/fuel-logs/:id`        | partial fields                                                           | `{ data: FuelLog }`       | FLEET_MANAGER           |
| DELETE | `/fuel-logs/:id`        | —                                                                        | `{ message }`             | FLEET_MANAGER           |

---

### Expenses

| Method | Endpoint              | Body / Params                                                         | Response                  | Roles                              |
| ------ | --------------------- | --------------------------------------------------------------------- | ------------------------- | ---------------------------------- |
| GET    | `/expenses`           | `?category=&vehicle_id=&trip_id=&page=&limit=`                       | `{ data: Expense[], … }` | All authed                         |
| GET    | `/expenses/:id`       | —                                                                     | `{ data: Expense }`       | All authed                         |
| POST   | `/expenses`           | `{ vehicle_id?, trip_id?, category, amount, description?, date }`     | `{ data: Expense }`       | FLEET_MANAGER, FINANCIAL_ANALYST   |
| PUT    | `/expenses/:id`       | partial fields                                                        | `{ data: Expense }`       | FLEET_MANAGER, FINANCIAL_ANALYST   |
| DELETE | `/expenses/:id`       | —                                                                     | `{ message }`             | FLEET_MANAGER                      |

---

### Dashboard / Analytics

| Method | Endpoint                   | Query Params                    | Response                                  | Roles      |
| ------ | -------------------------- | ------------------------------- | ----------------------------------------- | ---------- |
| GET    | `/dashboard/stats`         | —                               | `{ active_vehicles, on_trip_drivers, trips_today, pending_maintenance, monthly_fuel_cost, monthly_expense }` | All authed |
| GET    | `/reports/fuel-efficiency`  | `?vehicle_id=&from=&to=`       | `{ data: [ { vehicle_id, km_per_liter, total_fuel_cost } ] }` | FLEET_MANAGER, FINANCIAL_ANALYST |
| GET    | `/reports/vehicle-roi`      | `?vehicle_id=&from=&to=`       | `{ data: [ { vehicle_id, revenue, expenses, roi_percent } ] }` | FINANCIAL_ANALYST |
| GET    | `/reports/maintenance-summary` | `?from=&to=`                | `{ data: [ { vehicle_id, total_cost, log_count } ] }` | All authed |

---

## Business Rules

1. **Trip Creation Checks**
   - Vehicle must be `AVAILABLE` (not `ON_TRIP`, `IN_SHOP`, or `RETIRED`).
   - Driver must be `AVAILABLE` (not `ON_TRIP`, `OFF_DUTY`, or `SUSPENDED`).
   - `cargo_weight_kg` must not exceed `vehicle.capacity_kg`.
   - Driver's `license_expiry` must be in the future.

2. **Status Transitions (Automatic)**
   - Dispatching a trip → Vehicle & Driver become `ON_TRIP`.
   - Completing a trip → Vehicle & Driver return to `AVAILABLE`.
   - Cancelling a trip → Vehicle & Driver return to `AVAILABLE` (if currently `ON_TRIP`).
   - Creating a maintenance log can optionally set Vehicle to `IN_SHOP`.

3. **Deletion Guards**
   - Cannot delete a Vehicle that is `ON_TRIP`.
   - Cannot delete a Driver that is `ON_TRIP`.
   - Soft-delete preferred (set `is_active = false` or `status = RETIRED`).

4. **Pagination Defaults**
   - `page = 1`, `limit = 20`, max `limit = 100`.

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Backend    | Node.js + Express             |
| Database   | PostgreSQL                    |
| ORM        | Prisma                        |
| Auth       | JWT (jsonwebtoken + bcrypt)   |
| Frontend   | React (Vite)                  |
| Styling    | Vanilla CSS                   |

---

## Getting Started

```bash
# Clone
git clone https://github.com/Shiv-Patel-416/TransitOps.git
cd TransitOps

# Backend
cd server
npm install
cp .env.example .env   # fill in DB url, JWT secret
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

---

## Project Structure (planned)

```
TransitOps/
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/        # Express routers
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # auth, rbac, error handling
│   │   ├── services/      # Business logic
│   │   ├── utils/         # helpers
│   │   └── index.js       # entry point
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/      # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```
