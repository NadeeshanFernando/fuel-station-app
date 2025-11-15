# Python API Migration Guide

Complete documentation for migrating the Fuel Station Management System API from Next.js to Python.

## Table of Contents
1. [Recommended Python Stack](#recommended-python-stack)
2. [Project Structure](#project-structure)
3. [API Endpoints Documentation](#api-endpoints-documentation)
4. [Authentication & Middleware](#authentication--middleware)
5. [Database Models](#database-models)
6. [Best Practices](#best-practices)

---

## Recommended Python Stack

### Framework: **FastAPI** (Recommended)
- **Why FastAPI?**
  - Native async/await support (similar to Next.js async functions)
  - Automatic OpenAPI/Swagger documentation
  - Built-in data validation using Pydantic (similar to Zod)
  - High performance (comparable to Node.js)
  - Type hints for better code quality
  
### Alternative: **Flask** (Simpler but less features)

### Core Dependencies:
\`\`\`txt
fastapi==0.104.1          # Web framework
uvicorn==0.24.0           # ASGI server
pydantic==2.5.0           # Data validation (like Zod)
sqlalchemy==2.0.23        # ORM (like Prisma)
psycopg2-binary==2.9.9    # PostgreSQL driver
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4    # Password hashing
python-multipart==0.0.6   # File uploads
python-dotenv==1.0.0      # Environment variables
\`\`\`

---

## Project Structure

\`\`\`
fuel-station-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration & environment variables
│   │
│   ├── models/                 # SQLAlchemy models (database tables)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── fuel_type.py
│   │   ├── pump.py
│   │   ├── pump_shift.py
│   │   └── salary.py
│   │
│   ├── schemas/                # Pydantic schemas (request/response validation)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── fuel_type.py
│   │   ├── pump.py
│   │   ├── pump_shift.py
│   │   └── salary.py
│   │
│   ├── api/                    # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependency injection (auth middleware)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py        # /api/auth/*
│   │   │   ├── users.py       # /api/users/*
│   │   │   ├── employees.py   # /api/employees/*
│   │   │   ├── fuel_types.py  # /api/fuel-types/*
│   │   │   ├── pumps.py       # /api/pumps/*
│   │   │   ├── shifts.py      # /api/pump-shifts/*
│   │   │   ├── salary.py      # /api/salary/*
│   │   │   ├── fuel_stock.py  # /api/fuel-stock/*
│   │   │   └── reports.py     # /api/reports/*
│   │
│   ├── core/                   # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py        # Password hashing, JWT
│   │   └── database.py        # Database connection
│   │
│   └── utils/                  # Helper functions
│       ├── __init__.py
│       └── serializers.py     # Decimal to float conversion
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── tests/                      # Unit tests
│   ├── __init__.py
│   └── test_api/
│
├── .env                        # Environment variables
├── .env.example
├── requirements.txt            # Python dependencies
├── alembic.ini                # Database migration config
└── README.md
\`\`\`

---

## API Endpoints Documentation

### 🔐 Authentication Endpoints

#### 1. POST /api/auth/login
**Purpose:** Authenticate user and create JWT session token

**Request Body:**
\`\`\`json
{
  "username": "string (min 3 chars)",
  "password": "string (min 6 chars)"
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "success": true,
  "role": "ADMIN | CASHIER",
  "username": "string",
  "token": "jwt_token_string"
}
\`\`\`

**Response (Error 401):**
\`\`\`json
{
  "error": "Invalid username or password"
}
\`\`\`

**Response (Error 403):**
\`\`\`json
{
  "error": "Account is deactivated. Please contact administrator."
}
\`\`\`

**Business Logic:**
1. Validate input (username min 3, password min 6)
2. Find user by username in database
3. Check if user exists → 401 if not
4. Check if user.isActive → 403 if false
5. Verify password using bcrypt
6. Create JWT token with payload: {userId, username, role}
7. Set JWT expiration to 24 hours
8. Return token in response (set as cookie or return in body)

**Python Example:**
\`\`\`python
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, LoginResponse
from app.models.user import User
from app.api.deps import get_db

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token
    
    - **username**: User's username (min 3 characters)
    - **password**: User's password (min 6 characters)
    """
    # Find user
    user = db.query(User).filter(User.username == credentials.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Check if active
    if not user.is_active:
        raise HTTPException(
            status_code=403, 
            detail="Account is deactivated. Please contact administrator."
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Create token
    token = create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role}
    )
    
    return {
        "success": True,
        "role": user.role,
        "username": user.username,
        "token": token
    }
\`\`\`

---

#### 2. POST /api/auth/logout
**Purpose:** Clear session token

**Request:** No body required

**Response (Success 200):**
\`\`\`json
{
  "success": true
}
\`\`\`

**Business Logic:**
1. Clear JWT cookie (or client handles token deletion)
2. Return success response

**Python Example:**
\`\`\`python
@router.post("/logout")
async def logout():
    """Clear session - client should delete token"""
    return {"success": True}
\`\`\`

---

### 👥 User Management Endpoints (Admin Only)

#### 3. GET /api/users
**Purpose:** Get all system users (cashiers/admins)

**Authentication:** Admin only

**Query Parameters:** None

**Response (Success 200):**
\`\`\`json
{
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "username": "string",
      "role": "ADMIN | CASHIER",
      "isActive": boolean,
      "createdAt": "ISO8601 datetime"
    }
  ]
}
\`\`\`

**Business Logic:**
1. Verify user is authenticated and is ADMIN
2. Query all users from database
3. Exclude password hashes from response
4. Return array of users

**Python Example:**
\`\`\`python
from app.api.deps import get_current_admin_user

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users - Admin only"""
    users = db.query(User).all()
    return users
\`\`\`

---

#### 4. POST /api/users
**Purpose:** Create new system user (cashier/admin account)

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "username": "string (min 3 chars, unique)",
  "password": "string (min 6 chars)",
  "role": "ADMIN | CASHIER"
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "username": "string",
    "role": "string",
    "isActive": true,
    "createdAt": "ISO8601"
  }
}
\`\`\`

**Response (Error 400):**
\`\`\`json
{
  "error": "Username already exists"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Validate input data
3. Check if username already exists → 400 if yes
4. Hash password using bcrypt (10 rounds)
5. Create user record with isActive=true
6. Return created user (exclude password)

**Python Example:**
\`\`\`python
from app.core.security import get_password_hash

@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    user_in: CreateUserRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create new user - Admin only"""
    # Check if username exists
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user = User(
        name=user_in.name,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user
\`\`\`

---

#### 5. PATCH /api/users/{id}
**Purpose:** Update user details (name, password, active status)

**Authentication:** Admin only

**Path Parameters:**
- `id`: User UUID

**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "password": "string (optional, min 6 chars)",
  "isActive": boolean (optional)
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "username": "string",
    "role": "string",
    "isActive": boolean,
    "updatedAt": "ISO8601"
  }
}
\`\`\`

**Response (Error 404):**
\`\`\`json
{
  "error": "User not found"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find user by ID → 404 if not found
3. Update only provided fields
4. If password provided, hash it before saving
5. Update updatedAt timestamp
6. Return updated user

**Python Example:**
\`\`\`python
@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UpdateUserRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user - Admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_update.name:
        user.name = user_update.name
    if user_update.password:
        user.password_hash = get_password_hash(user_update.password)
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    return user
\`\`\`

---

### 👷 Employee Management Endpoints (Admin Only)

#### 6. GET /api/employees
**Purpose:** Get all employees (staff who may not have system accounts)

**Authentication:** Admin only

**Query Parameters:**
- `isActive` (optional): "true" | "false" - filter by active status

**Response (Success 200):**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "string",
    "position": "string",
    "phoneNumber": "string | null",
    "address": "string | null",
    "joinDate": "ISO8601 date",
    "basicSalary": number,
    "isActive": boolean,
    "createdAt": "ISO8601"
  }
]
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Apply isActive filter if provided
3. Query employees ordered by createdAt desc
4. Convert Decimal basicSalary to float
5. Return array of employees

---

#### 7. POST /api/employees
**Purpose:** Create new employee record

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "position": "string (min 2 chars)",
  "phoneNumber": "string (optional)",
  "address": "string (optional)",
  "joinDate": "ISO8601 date (optional, defaults to today)",
  "basicSalary": number (positive)
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "id": "uuid",
  "name": "string",
  "position": "string",
  "basicSalary": number,
  "isActive": true,
  "createdAt": "ISO8601"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Validate input data
3. Create employee with isActive=true
4. Default joinDate to today if not provided
5. Convert Decimal to float in response
6. Return created employee

---

#### 8. PUT /api/employees/{id}
**Purpose:** Update employee details

**Authentication:** Admin only

**Path Parameters:**
- `id`: Employee UUID

**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "position": "string (optional)",
  "phoneNumber": "string (optional)",
  "address": "string (optional)",
  "basicSalary": number (optional)",
  "isActive": boolean (optional)
}
\`\`\`

**Response:** Same as create employee

---

#### 9. DELETE /api/employees/{id}
**Purpose:** Delete employee record

**Authentication:** Admin only

**Path Parameters:**
- `id`: Employee UUID

**Response (Success 200):**
\`\`\`json
{
  "success": true
}
\`\`\`

**Response (Error 404):**
\`\`\`json
{
  "error": "Employee not found"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find employee by ID
3. Check if employee has salary records → prevent deletion if yes (or cascade)
4. Delete employee
5. Return success

---

### ⛽ Fuel Type Endpoints

#### 10. GET /api/fuel-types
**Purpose:** Get all fuel types with current price

**Authentication:** Required (any role)

**Response (Success 200):**
\`\`\`json
{
  "fuelTypes": [
    {
      "id": "uuid",
      "name": "string",
      "color": "#RRGGBB (hex color)",
      "tankCapacity": number,
      "minStockAlert": number,
      "currentStock": number,
      "isActive": boolean,
      "currentPrice": number | null,
      "createdAt": "ISO8601"
    }
  ]
}
\`\`\`

**Business Logic:**
1. Query all fuel types
2. Join with priceHistory where effectiveTo is null (current price)
3. Convert all Decimal fields to floats
4. Return array ordered by name

---

#### 11. POST /api/fuel-types
**Purpose:** Create new fuel type

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars, unique)",
  "color": "string (#RRGGBB format, default '#3b82f6')",
  "tankCapacity": number (optional, default 10000),
  "minStockAlert": number (optional, default 1000)
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "fuelType": {
    "id": "uuid",
    "name": "string",
    "color": "string",
    "tankCapacity": number,
    "minStockAlert": number,
    "currentStock": 0,
    "isActive": true
  }
}
\`\`\`

**Response (Error 400):**
\`\`\`json
{
  "error": "Fuel type already exists"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Validate input (color regex, positive numbers)
3. Check if name already exists
4. Create fuel type with currentStock=0, isActive=true
5. Return created fuel type

---

#### 12. PATCH /api/fuel-types/{id}
**Purpose:** Update fuel type (tank config, color, active status)

**Authentication:** Admin only

**Path Parameters:**
- `id`: FuelType UUID

**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "color": "string (optional)",
  "tankCapacity": number (optional)",
  "minStockAlert": number (optional)",
  "currentStock": number (optional)",
  "isActive": boolean (optional)
}
\`\`\`

**Response:** Same as create

**Business Logic:**
1. Verify admin authentication
2. Find fuel type by ID
3. Update only provided fields
4. Validate constraints
5. Return updated fuel type

---

#### 13. POST /api/fuel-types/price
**Purpose:** Update fuel price (creates new price history entry)

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "fuelTypeId": "uuid",
  "pricePerLiter": number (positive)
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "priceHistory": {
    "id": "uuid",
    "fuelTypeId": "uuid",
    "pricePerLiter": number,
    "effectiveFrom": "ISO8601",
    "effectiveTo": null
  }
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find fuel type by ID
3. Find current price (effectiveTo = null)
4. If exists, set its effectiveTo to now
5. Create new price history with effectiveFrom = now, effectiveTo = null
6. Return new price record

---

### 🚰 Pump Endpoints

#### 14. GET /api/pumps
**Purpose:** Get all pumps with fuel type info

**Authentication:** Required

**Response (Success 200):**
\`\`\`json
{
  "pumps": [
    {
      "id": "uuid",
      "name": "string",
      "fuelTypeId": "uuid",
      "isActive": boolean,
      "createdAt": "ISO8601",
      "fuelType": {
        "id": "uuid",
        "name": "string",
        "color": "string"
      }
    }
  ]
}
\`\`\`

**Business Logic:**
1. Query all pumps with fuelType relation
2. Order by name
3. Return array

---

#### 15. POST /api/pumps
**Purpose:** Create new pump

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "fuelTypeId": "uuid"
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "pump": {
    "id": "uuid",
    "name": "string",
    "fuelTypeId": "uuid",
    "isActive": true,
    "fuelType": {...}
  }
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Validate fuel type exists
3. Create pump with isActive=true
4. Return pump with fuelType relation

---

#### 16. PATCH /api/pumps/{id}
**Purpose:** Update pump (name, fuel type, active status)

**Authentication:** Admin only

**Path Parameters:**
- `id`: Pump UUID

**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "fuelTypeId": "uuid (optional)",
  "isActive": boolean (optional)
}
\`\`\`

**Response:** Same as create

---

### 📊 Pump Shift Endpoints

#### 17. GET /api/pump-shifts
**Purpose:** Get pump shifts with filters

**Authentication:** Required (cashiers see only their shifts)

**Query Parameters:**
- `status` (optional): "OPEN" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
- `cashierId` (optional): UUID (admin only)
- `pumpId` (optional): UUID
- `date` (optional): ISO date string

**Response (Success 200):**
\`\`\`json
{
  "shifts": [
    {
      "id": "uuid",
      "pumpId": "uuid",
      "fuelTypeId": "uuid",
      "cashierId": "uuid",
      "attendantName": "string",
      "openingReading": number,
      "closingReading": number | null,
      "litersSold": number,
      "pricePerLiter": number,
      "expectedAmount": number,
      "cashAmount": number,
      "cardAmount": number,
      "creditAmount": number,
      "difference": number,
      "status": "string",
      "startTime": "ISO8601",
      "endTime": "ISO8601 | null",
      "remarks": "string | null",
      "pump": {...},
      "fuelType": {...},
      "cashier": {
        "id": "uuid",
        "name": "string",
        "username": "string"
      }
    }
  ]
}
\`\`\`

**Business Logic:**
1. Verify authentication
2. If CASHIER role, filter by cashierId = current user
3. Apply other filters from query params
4. Include pump, fuelType, cashier relations
5. Order by startTime desc
6. Convert all Decimal fields to floats
7. Return shifts array

---

#### 18. POST /api/pump-shifts
**Purpose:** Start new shift

**Authentication:** CASHIER only

**Request Body:**
\`\`\`json
{
  "pumpId": "uuid",
  "attendantName": "string (min 2 chars)",
  "openingReading": number (non-negative)
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "shift": {
    "id": "uuid",
    "pumpId": "uuid",
    "fuelTypeId": "uuid",
    "cashierId": "uuid",
    "attendantName": "string",
    "openingReading": number,
    "pricePerLiter": number,
    "status": "OPEN",
    "startTime": "ISO8601",
    "pump": {...},
    "fuelType": {...}
  }
}
\`\`\`

**Response (Error 400):**
\`\`\`json
{
  "error": "This pump already has an open shift"
}
\`\`\`

**Response (Error 404):**
\`\`\`json
{
  "error": "Cashier account not found. Please contact admin."
}
\`\`\`

**Business Logic:**
1. Verify cashier authentication
2. Validate cashier exists in database
3. Find pump and include fuelType
4. Check pump is active
5. Get current price from priceHistory (effectiveTo = null)
6. Check no other OPEN shift exists for this pump
7. Create shift with status=OPEN, cashierId from token
8. Return shift with relations

---

#### 19. GET /api/pump-shifts/{id}
**Purpose:** Get single shift details

**Authentication:** Required (cashiers only their shifts)

**Path Parameters:**
- `id`: Shift UUID

**Response:** Same structure as shift in array

**Business Logic:**
1. Verify authentication
2. Find shift by ID with relations
3. If CASHIER role, verify shift belongs to them
4. Convert Decimals to floats
5. Return shift

---

#### 20. PATCH /api/pump-shifts/{id}
**Purpose:** Close shift (end shift, record sales)

**Authentication:** CASHIER only (must own the shift)

**Path Parameters:**
- `id`: Shift UUID

**Request Body:**
\`\`\`json
{
  "closingReading": number (non-negative),
  "cashAmount": number (non-negative),
  "cardAmount": number (non-negative),
  "creditAmount": number (optional, non-negative, default 0),
  "remarks": "string (optional)"
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "shift": {
    ... // full shift object with calculated fields
    "closingReading": number,
    "litersSold": number,
    "expectedAmount": number,
    "cashAmount": number,
    "cardAmount": number,
    "creditAmount": number,
    "difference": number,
    "status": "PENDING_APPROVAL",
    "endTime": "ISO8601"
  }
}
\`\`\`

**Response (Error 400):**
\`\`\`json
{
  "error": "Shift is not open"
}
\`\`\`

**Business Logic:**
1. Verify cashier authentication
2. Find shift by ID
3. Verify shift belongs to current cashier
4. Verify shift status is OPEN
5. Validate closingReading > openingReading
6. Calculate:
   - litersSold = closingReading - openingReading
   - expectedAmount = litersSold * pricePerLiter
   - actualReceived = cashAmount + cardAmount + creditAmount
   - difference = actualReceived - expectedAmount
7. Update shift with closing data, status=PENDING_APPROVAL, endTime=now
8. Return updated shift

---

#### 21. POST /api/pump-shifts/{id}/interim
**Purpose:** Record interim handover (mid-shift cash collection)

**Authentication:** CASHIER only (must own the shift)

**Path Parameters:**
- `id`: Shift UUID

**Request Body:**
\`\`\`json
{
  "handoverAmount": number (positive),
  "remarks": "string (optional)"
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "interimHandover": {
    "id": "uuid",
    "shiftId": "uuid",
    "handoverAmount": number,
    "handoverTime": "ISO8601",
    "remarks": "string | null"
  }
}
\`\`\`

**Business Logic:**
1. Verify cashier authentication
2. Find shift, verify belongs to cashier
3. Verify shift status is OPEN
4. Create InterimHandover record
5. Return handover record

---

#### 22. POST /api/pump-shifts/approve
**Purpose:** Approve or reject shift handover

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "shiftId": "uuid",
  "status": "APPROVED | REJECTED"
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "shift": {
    ... // full shift with updated status
    "status": "APPROVED | REJECTED"
  }
}
\`\`\`

**Response (Error 400):**
\`\`\`json
{
  "error": "Shift is not pending approval"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find shift by ID
3. Verify status is PENDING_APPROVAL
4. Update status to APPROVED or REJECTED
5. Return updated shift

---

### 📦 Fuel Stock Endpoints

#### 23. GET /api/fuel-stock/view
**Purpose:** Get current stock levels for all fuel types

**Authentication:** Required

**Response (Success 200):**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "string",
    "color": "string",
    "tankCapacity": number,
    "currentStock": number,
    "minStockAlert": number,
    "percentageFull": number,
    "status": "critical | low | normal | high"
  }
]
\`\`\`

**Business Logic:**
1. Query all fuel types
2. For each, calculate:
   - percentageFull = (currentStock / tankCapacity) * 100
   - status = "critical" if < 10%, "low" if < 25%, "normal" if < 90%, "high" if >= 90%
3. Convert Decimals to floats
4. Return array

---

#### 24. GET /api/fuel-stock/opening
**Purpose:** Get opening stock records with filters

**Authentication:** Admin only

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response (Success 200):**
\`\`\`json
[
  {
    "id": "uuid",
    "fuelTypeId": "uuid",
    "date": "ISO date",
    "openingStockLiters": number,
    "createdAt": "ISO8601",
    "fuelType": {...}
  }
]
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Query FuelDailyStock with date filters
3. Include fuelType relation
4. Convert Decimals to floats
5. Return array

---

#### 25. POST /api/fuel-stock/opening
**Purpose:** Record opening stock for a date

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "date": "ISO date",
  "fuelTypeId": "uuid",
  "openingStockLiters": number (non-negative)
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "stock": {
    "id": "uuid",
    "fuelTypeId": "uuid",
    "date": "ISO date",
    "openingStockLiters": number,
    "fuelType": {...}
  }
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Check if opening stock already recorded for date+fuelType
3. Create or update opening stock record
4. Update fuelType.currentStock
5. Return stock record

---

#### 26. POST /api/fuel-stock/closing
**Purpose:** Record closing physical stock

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "date": "ISO date",
  "fuelTypeId": "uuid",
  "closingPhysicalStockLiters": number (non-negative)
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  "stock": {
    "id": "uuid",
    "closingPhysicalStockLiters": number,
    "bookStock": number,
    "variance": number
  }
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find opening stock for date
3. Calculate book stock from sales
4. Calculate variance = physical - book
5. Update stock record
6. Update fuelType.currentStock
7. Return updated record

---

#### 27. GET /api/fuel-deliveries
**Purpose:** Get fuel delivery records

**Authentication:** Admin only

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response (Success 200):**
\`\`\`json
[
  {
    "id": "uuid",
    "fuelTypeId": "uuid",
    "date": "ISO date",
    "quantityLiters": number,
    "invoiceNumber": "string | null",
    "remarks": "string | null",
    "createdAt": "ISO8601",
    "fuelType": {...}
  }
]
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Query deliveries with date filters
3. Include fuelType relation
4. Convert Decimals to floats
5. Return array ordered by date desc

---

#### 28. POST /api/fuel-deliveries
**Purpose:** Record fuel delivery

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "fuelTypeId": "uuid",
  "date": "ISO date or datetime",
  "quantityLiters": number (positive),
  "invoiceNumber": "string (optional)",
  "remarks": "string (optional)"
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  "delivery": {
    "id": "uuid",
    "fuelTypeId": "uuid",
    "date": "ISO date",
    "quantityLiters": number,
    "fuelType": {...}
  }
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Validate fuelType exists
3. Create delivery record
4. Update fuelType.currentStock += quantityLiters
5. Return delivery with fuelType

---

### 💰 Salary Endpoints

#### 29. GET /api/salary
**Purpose:** Get salary records with filters

**Authentication:** Admin only

**Query Parameters:**
- `employeeId` (optional): UUID
- `month` (optional): 1-12
- `year` (optional): YYYY

**Response (Success 200):**
\`\`\`json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "month": number,
    "year": number,
    "basicSalary": number,
    "totalSalary": number,
    "fullDayLeaves": number,
    "halfDayLeaves": number,
    "loanAmount": number,
    "totalDeductions": number,
    "netSalary": number,
    "remarks": "string | null",
    "createdAt": "ISO8601",
    "employee": {
      "id": "uuid",
      "name": "string",
      "position": "string"
    }
  }
]
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Apply filters
3. Include employee relation
4. Order by year desc, month desc
5. Convert all Decimal fields to floats
6. Return array

---

#### 30. POST /api/salary
**Purpose:** Calculate and create salary record

**Authentication:** Admin only

**Request Body:**
\`\`\`json
{
  "employeeId": "uuid",
  "month": number (1-12),
  "year": number (>= 2020),
  "basicSalary": number (positive),
  "totalSalary": number (positive),
  "fullDayLeaves": number (non-negative, default 0),
  "halfDayLeaves": number (non-negative, default 0),
  "loanAmount": number (non-negative, default 0),
  "remarks": "string (optional)"
}
\`\`\`

**Response (Success 201):**
\`\`\`json
{
  ... // salary record with calculated fields
}
\`\`\`

**Response (Error 409):**
\`\`\`json
{
  "error": "Salary record already exists for this employee and month"
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Check employee exists
3. Check no duplicate (employeeId + month + year unique)
4. Calculate deductions:
   - workingDaysPerMonth = 26
   - perDayDeduction = totalSalary / 26
   - fullDayDeduction = fullDayLeaves * perDayDeduction
   - halfDayDeduction = halfDayLeaves * (perDayDeduction / 2)
   - totalDeductions = fullDayDeduction + halfDayDeduction + loanAmount
   - netSalary = totalSalary - totalDeductions
5. Create salary record with calculated values
6. Include employee relation
7. Convert Decimals to floats
8. Return salary record

---

#### 31. PUT /api/salary/{id}
**Purpose:** Update and recalculate salary record

**Authentication:** Admin only

**Path Parameters:**
- `id`: Salary record UUID

**Request Body:**
\`\`\`json
{
  "basicSalary": number (optional),
  "totalSalary": number (optional),
  "fullDayLeaves": number (optional),
  "halfDayLeaves": number (optional),
  "loanAmount": number (optional),
  "remarks": "string (optional)"
}
\`\`\`

**Response (Success 200):**
\`\`\`json
{
  ... // updated salary record with recalculated fields
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find salary record by ID
3. Update provided fields
4. Recalculate deductions and netSalary
5. Save and return updated record

---

#### 32. DELETE /api/salary/{id}
**Purpose:** Delete salary record

**Authentication:** Admin only

**Path Parameters:**
- `id`: Salary record UUID

**Response (Success 200):**
\`\`\`json
{
  "success": true
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Find and delete record
3. Return success

---

### 📈 Reports Endpoints

#### 33. GET /api/reports/sales
**Purpose:** Generate sales report with analytics

**Authentication:** Admin only

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date
- `pumpId` (optional): UUID

**Response (Success 200):**
\`\`\`json
{
  "shifts": [
    ... // array of approved shifts
  ],
  "summary": {
    "totalSales": number,
    "totalLiters": number,
    "totalShifts": number
  },
  "fuelTypeSummary": [
    {
      "fuelTypeName": "string",
      "totalLiters": number,
      "totalSales": number,
      "shiftCount": number
    }
  ],
  "cashierSummary": [
    {
      "cashierName": "string",
      "shiftCount": number,
      "totalSales": number,
      "totalLiters": number
    }
  ]
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Query approved shifts with filters
3. Calculate summary totals
4. Aggregate by fuel type
5. Aggregate by cashier
6. Convert all Decimals to floats
7. Return comprehensive report

---

#### 34. GET /api/reports/fuel-stock
**Purpose:** Get fuel stock report with history

**Authentication:** Admin only

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response (Success 200):**
\`\`\`json
{
  "currentStock": [
    {
      "fuelTypeName": "string",
      "color": "string",
      "currentStock": number,
      "tankCapacity": number,
      "percentageFull": number,
      "status": "string"
    }
  ],
  "deliveries": [...],
  "stockMovements": [...]
}
\`\`\`

**Business Logic:**
1. Verify admin authentication
2. Get current stock for all fuel types
3. Get deliveries within date range
4. Get daily stock movements
5. Convert Decimals to floats
6. Return comprehensive stock report

---

### 🐛 Debug Endpoint

#### 35. GET /api/debug/db-status
**Purpose:** Debug database connection and seeded data

**Authentication:** None (development only)

**Response (Success 200):**
\`\`\`json
{
  "database": "connected",
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "role": "string",
      "isActive": boolean
    }
  ],
  "fuelTypes": [...],
  "pumps": [...],
  "employees": [...]
}
\`\`\`

**Business Logic:**
1. Query counts and sample records from all tables
2. Return overview for debugging
3. **Note:** Remove in production!

---

## Authentication & Middleware

### Security Module (app/core/security.py)

\`\`\`python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt (10 rounds)"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Payload to encode (userId, username, role)
        expires_delta: Optional expiration time (default 24 hours)
    
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm="HS256"
    )
    
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """
    Verify and decode JWT token
    
    Returns:
        Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        return None
\`\`\`

### Dependency Injection (app/api/deps.py)

\`\`\`python
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import verify_token
from app.models.user import User

# Security scheme
security = HTTPBearer()

def get_db() -> Generator:
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Raises:
        HTTPException: 401 if token invalid or user not found
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verify current user is admin
    
    Raises:
        HTTPException: 403 if user is not admin
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_current_cashier_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verify current user is cashier
    
    Raises:
        HTTPException: 403 if user is not cashier
    """
    if current_user.role != "CASHIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cashier access required"
        )
    return current_user
\`\`\`

### Usage Example in Routes:

\`\`\`python
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_current_admin_user, get_db

router = APIRouter()

# Any authenticated user
@router.get("/protected")
async def protected_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": f"Hello {current_user.name}"}

# Admin only
@router.post("/admin-only")
async def admin_route(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return {"message": "Admin access granted"}
\`\`\`

---

## Database Models

### SQLAlchemy Model Example (app/models/user.py)

\`\`\`python
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CASHIER = "CASHIER"

class User(Base):
    """System user model for authentication"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pump_shifts = relationship("PumpShift", back_populates="cashier")
\`\`\`

### Pydantic Schema Example (app/schemas/user.py)

\`\`\`python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    """Base user schema"""
    name: str = Field(min_length=2)
    username: str = Field(min_length=3)
    role: str = Field(pattern="^(ADMIN|CASHIER)$")

class CreateUserRequest(UserBase):
    """Request schema for creating user"""
    password: str = Field(min_length=6)

class UpdateUserRequest(BaseModel):
    """Request schema for updating user"""
    name: Optional[str] = Field(None, min_length=2)
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """Response schema for user (excludes password)"""
    id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows Pydantic to work with SQLAlchemy models
\`\`\`

---

## Best Practices

### 1. Project Organization

**Separate concerns:**
- Models (database tables)
- Schemas (request/response validation)
- Routes (API endpoints)
- Services (business logic)
- Dependencies (auth middleware)

**Example service layer:**
\`\`\`python
# app/services/salary_service.py
from sqlalchemy.orm import Session
from app.models.salary import SalaryRecord

class SalaryService:
    """Business logic for salary calculations"""
    
    WORKING_DAYS_PER_MONTH = 26
    
    @staticmethod
    def calculate_salary(
        total_salary: float,
        full_day_leaves: int,
        half_day_leaves: int,
        loan_amount: float
    ) -> dict:
        """Calculate salary with deductions"""
        per_day_deduction = total_salary / SalaryService.WORKING_DAYS_PER_MONTH
        full_day_deduction = full_day_leaves * per_day_deduction
        half_day_deduction = half_day_leaves * (per_day_deduction / 2)
        total_deductions = full_day_deduction + half_day_deduction + loan_amount
        net_salary = total_salary - total_deductions
        
        return {
            "total_deductions": round(total_deductions, 2),
            "net_salary": round(net_salary, 2)
        }
\`\`\`

### 2. Error Handling

**Use FastAPI's HTTPException:**
\`\`\`python
from fastapi import HTTPException

# Not found
raise HTTPException(status_code=404, detail="Resource not found")

# Validation error
raise HTTPException(status_code=400, detail="Invalid input")

# Unauthorized
raise HTTPException(status_code=401, detail="Authentication required")

# Forbidden
raise HTTPException(status_code=403, detail="Insufficient permissions")

# Conflict
raise HTTPException(status_code=409, detail="Resource already exists")
\`\`\`

### 3. Decimal Handling

**Always convert Decimal to float for JSON:**
\`\`\`python
from decimal import Decimal

def serialize_decimal(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

# In Pydantic schemas
class FuelTypeResponse(BaseModel):
    tank_capacity: float
    current_stock: float
    
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: float
        }
\`\`\`

### 4. Database Queries

**Use SQLAlchemy efficiently:**
\`\`\`python
# Good: Single query with join
shifts = db.query(PumpShift)\
    .join(PumpShift.pump)\
    .join(PumpShift.fuel_type)\
    .filter(PumpShift.status == "APPROVED")\
    .all()

# Bad: N+1 queries
shifts = db.query(PumpShift).all()
for shift in shifts:
    pump = shift.pump  # Extra query per shift
\`\`\`

### 5. Input Validation

**Use Pydantic validators:**
\`\`\`python
from pydantic import BaseModel, validator

class CloseShiftRequest(BaseModel):
    closing_reading: float
    
    @validator('closing_reading')
    def closing_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Closing reading must be non-negative')
        return v
\`\`\`

### 6. Configuration

**Use environment variables:**
\`\`\`python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    
    class Config:
        env_file = ".env"

settings = Settings()
\`\`\`

### 7. Logging

**Use Python logging:**
\`\`\`python
import logging

logger = logging.getLogger(__name__)

@router.post("/shifts")
async def create_shift(shift_data: CreateShiftRequest):
    try:
        # logic
        logger.info(f"Shift created: {shift.id}")
        return shift
    except Exception as e:
        logger.error(f"Error creating shift: {str(e)}")
        raise
\`\`\`

### 8. Testing

**Use pytest with FastAPI TestClient:**
\`\`\`python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "wrong"
    })
    assert response.status_code == 401
\`\`\`

### 9. CORS Configuration

**Enable CORS for frontend:**
\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

### 10. API Documentation

**FastAPI auto-generates docs at:**
- `/docs` - Swagger UI
- `/redoc` - ReDoc

**Add descriptions:**
\`\`\`python
@router.post(
    "/shifts",
    response_model=ShiftResponse,
    status_code=201,
    summary="Start new pump shift",
    description="Creates a new shift for cashier. Validates pump availability and gets current fuel price."
)
async def create_shift(...):
    ...
\`\`\`

---

## Migration Checklist

- [ ] Set up Python environment (Python 3.10+)
- [ ] Install dependencies from requirements.txt
- [ ] Configure PostgreSQL connection in .env
- [ ] Create SQLAlchemy models matching Prisma schema
- [ ] Set up Alembic for migrations
- [ ] Implement authentication (JWT + bcrypt)
- [ ] Create Pydantic schemas for validation
- [ ] Implement API routes (35 endpoints documented)
- [ ] Add dependency injection for auth
- [ ] Test all endpoints with sample data
- [ ] Set up CORS for frontend
- [ ] Configure logging
- [ ] Write unit tests
- [ ] Deploy to production server
- [ ] Update frontend to use new API URL

---

## Additional Resources

**FastAPI Documentation:** https://fastapi.tiangolo.com/
**SQLAlchemy ORM:** https://docs.sqlalchemy.org/
**Pydantic Validation:** https://docs.pydantic.dev/
**Alembic Migrations:** https://alembic.sqlalchemy.org/

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
