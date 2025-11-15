# API Registry - Complete Endpoint Documentation

This document contains all API endpoints in the Fuel Station Management System, organized for easy reference and migration.

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Employee Management APIs](#employee-management-apis)
4. [Fuel Type Management APIs](#fuel-type-management-apis)
5. [Pump Management APIs](#pump-management-apis)
6. [Fuel Stock Management APIs](#fuel-stock-management-apis)
7. [Fuel Delivery APIs](#fuel-delivery-apis)
8. [Pump Shift Management APIs](#pump-shift-management-apis)
9. [Report APIs](#report-apis)
10. [Salary Management APIs](#salary-management-apis)
11. [Debug/Utility APIs](#debugutility-apis)

---

## Authentication APIs

### POST /api/auth/login
**Description:** User authentication  
**Authentication:** None (public)  
**Request Body:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`
**Response:**
\`\`\`json
{
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "role": "ADMIN | CASHIER",
    "isActive": "boolean"
  }
}
\`\`\`
**Business Logic:**
- Validate username and password
- Compare hashed password with bcrypt
- Generate JWT token (expires in 7 days)
- Set session cookie
- Return user data without password

### POST /api/auth/logout
**Description:** User logout  
**Authentication:** Required  
**Request Body:** None  
**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`
**Business Logic:**
- Clear session cookie
- No server-side session management (stateless JWT)

---

## User Management APIs

### GET /api/users
**Description:** List all system users (with login credentials)  
**Authentication:** Required (Admin only)  
**Query Parameters:** None  
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "role": "ADMIN | CASHIER",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
\`\`\`

### POST /api/users
**Description:** Create new system user  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "username": "string (min 3 chars)",
  "password": "string (min 6 chars)",
  "fullName": "string (min 2 chars)",
  "role": "ADMIN | CASHIER"
}
\`\`\`
**Response:** User object (same as GET)  
**Business Logic:**
- Check for duplicate username
- Hash password with bcrypt (10 rounds)
- Set isActive to true by default

### PUT /api/users/:id
**Description:** Update system user  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "username": "string (optional)",
  "password": "string (optional, min 6 chars)",
  "fullName": "string (optional)",
  "role": "ADMIN | CASHIER (optional)",
  "isActive": "boolean (optional)"
}
\`\`\`
**Response:** Updated user object  
**Business Logic:**
- Check if user exists
- If username changed, check for duplicates
- If password provided, hash it with bcrypt
- Update only provided fields

### DELETE /api/users/:id
**Description:** Delete system user  
**Authentication:** Required (Admin only)  
**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`
**Business Logic:**
- Check if user exists
- Prevent deleting user with active pump shifts
- Soft delete recommended (set isActive = false)

---

## Employee Management APIs

### GET /api/employees
**Description:** List all employees (including non-system users)  
**Authentication:** Required  
**Query Parameters:** None  
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "name": "string",
    "position": "string",
    "contactNumber": "string",
    "basicSalary": "number",
    "isActive": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
\`\`\`

### POST /api/employees
**Description:** Create new employee  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "position": "string (min 2 chars)",
  "contactNumber": "string (min 10 chars)",
  "basicSalary": "number (positive)"
}
\`\`\`
**Response:** Employee object  
**Business Logic:**
- Validate all required fields
- Set isActive to true by default
- basicSalary is stored as Decimal in database

### PUT /api/employees/:id
**Description:** Update employee  
**Authentication:** Required (Admin only)  
**Request Body:** Same as POST (all fields optional)  
**Response:** Updated employee object  
**Business Logic:**
- Check if employee exists
- Update only provided fields
- Validate basicSalary is positive if provided

### DELETE /api/employees/:id
**Description:** Delete employee  
**Authentication:** Required (Admin only)  
**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`
**Business Logic:**
- Check if employee exists
- Check for existing salary records
- Soft delete recommended (set isActive = false)

---

## Fuel Type Management APIs

### GET /api/fuel-types
**Description:** List all fuel types with tank configuration  
**Authentication:** Required  
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "name": "string",
    "color": "string (hex color)",
    "tankCapacity": "number",
    "minAlertLevel": "number",
    "currentStock": "number",
    "isActive": "boolean",
    "createdAt": "datetime",
    "currentPrice": "number (from latest price history)"
  }
]
\`\`\`

### POST /api/fuel-types
**Description:** Create new fuel type  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "color": "string (hex color, e.g., #FF5733)",
  "tankCapacity": "number (positive)",
  "minAlertLevel": "number (positive, less than capacity)",
  "currentStock": "number (positive, less than capacity)",
  "initialPrice": "number (positive)"
}
\`\`\`
**Response:** FuelType object  
**Business Logic:**
- Check for duplicate fuel type name
- Validate minAlertLevel < tankCapacity
- Validate currentStock <= tankCapacity
- Create initial price history record
- Set isActive to true

### PUT /api/fuel-types/:id
**Description:** Update fuel type and tank configuration  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "color": "string (optional)",
  "tankCapacity": "number (optional)",
  "minAlertLevel": "number (optional)",
  "currentStock": "number (optional)",
  "isActive": "boolean (optional)"
}
\`\`\`
**Response:** Updated FuelType object  
**Business Logic:**
- Validate capacity constraints if provided
- If name changed, check for duplicates
- Update only provided fields

### POST /api/fuel-types/price
**Description:** Update fuel price (creates price history)  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "fuelTypeId": "string",
  "newPrice": "number (positive)"
}
\`\`\`
**Response:**
\`\`\`json
{
  "id": "string",
  "fuelTypeId": "string",
  "price": "number",
  "effectiveFrom": "datetime"
}
\`\`\`
**Business Logic:**
- Check if fuel type exists
- Create new price history record
- effectiveFrom = current timestamp
- Previous prices remain in history for reporting

---

## Pump Management APIs

### GET /api/pumps
**Description:** List all pumps  
**Authentication:** Required  
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "name": "string",
    "fuelTypeId": "string",
    "isActive": "boolean",
    "createdAt": "datetime",
    "fuelType": {
      "name": "string",
      "color": "string"
    }
  }
]
\`\`\`

### POST /api/pumps
**Description:** Create new pump  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "name": "string (min 2 chars)",
  "fuelTypeId": "string"
}
\`\`\`
**Response:** Pump object with fuelType relation  
**Business Logic:**
- Validate fuel type exists
- Set isActive to true

### PUT /api/pumps/:id
**Description:** Update pump  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "fuelTypeId": "string (optional)",
  "isActive": "boolean (optional)"
}
\`\`\`
**Response:** Updated pump object  
**Business Logic:**
- Validate fuel type if provided
- Update only provided fields

### DELETE /api/pumps/:id
**Description:** Delete pump  
**Authentication:** Required (Admin only)  
**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`
**Business Logic:**
- Check for active shifts on this pump
- Prevent deletion if active shifts exist

---

## Fuel Stock Management APIs

### GET /api/fuel-stock/view
**Description:** Get current stock levels for all fuel types (for cylinder visualization)  
**Authentication:** Required  
**Response:**
\`\`\`json
[
  {
    "fuelTypeId": "string",
    "fuelTypeName": "string",
    "color": "string",
    "tankCapacity": "number",
    "currentStock": "number",
    "minAlertLevel": "number",
    "percentage": "number (0-100)",
    "status": "critical | low | normal | high"
  }
]
\`\`\`
**Business Logic:**
- Calculate percentage = (currentStock / tankCapacity) * 100
- Determine status:
  - critical: < 10% or below minAlertLevel
  - low: 10-25%
  - normal: 25-75%
  - high: > 75%

### POST /api/fuel-stock/opening
**Description:** Record opening stock for the day  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "fuelTypeId": "string",
  "quantity": "number (positive)",
  "recordedAt": "datetime"
}
\`\`\`
**Response:**
\`\`\`json
{
  "id": "string",
  "fuelTypeId": "string",
  "openingStock": "number",
  "recordedAt": "datetime",
  "type": "OPENING"
}
\`\`\`
**Business Logic:**
- Create FuelDailyStock record with type OPENING
- Update fuel type currentStock

### POST /api/fuel-stock/closing
**Description:** Record closing stock for the day  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "fuelTypeId": "string",
  "quantity": "number (positive)",
  "recordedAt": "datetime"
}
\`\`\`
**Response:** Same as opening  
**Business Logic:**
- Create FuelDailyStock record with type CLOSING
- Update fuel type currentStock
- Calculate variance from expected (opening - sales + deliveries)

---

## Fuel Delivery APIs

### GET /api/fuel-deliveries
**Description:** List all fuel deliveries  
**Authentication:** Required  
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "fuelTypeId": "string",
    "quantity": "number",
    "pricePerLiter": "number",
    "totalAmount": "number",
    "supplier": "string",
    "invoiceNumber": "string",
    "deliveryDate": "datetime",
    "createdAt": "datetime",
    "fuelType": {
      "name": "string",
      "color": "string"
    }
  }
]
\`\`\`

### POST /api/fuel-deliveries
**Description:** Record new fuel delivery  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "fuelTypeId": "string",
  "quantity": "number (positive)",
  "pricePerLiter": "number (positive)",
  "supplier": "string (min 2 chars)",
  "invoiceNumber": "string (optional)",
  "deliveryDate": "datetime"
}
\`\`\`
**Response:** FuelDelivery object  
**Business Logic:**
- Calculate totalAmount = quantity * pricePerLiter
- Update fuel type currentStock (add quantity)
- Check if new stock exceeds tank capacity (warning only)

---

## Pump Shift Management APIs

### GET /api/pump-shifts
**Description:** List pump shifts with filters  
**Authentication:** Required  
**Query Parameters:**
\`\`\`
?status=OPEN|CLOSED|PENDING_APPROVAL|APPROVED|REJECTED
\`\`\`
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "pumpId": "string",
    "fuelTypeId": "string",
    "cashierId": "string",
    "attendantName": "string",
    "openingReading": "number",
    "closingReading": "number",
    "litersSold": "number",
    "pricePerLiter": "number",
    "expectedAmount": "number",
    "cashAmount": "number",
    "cardAmount": "number",
    "creditAmount": "number",
    "difference": "number",
    "status": "OPEN | CLOSED | PENDING_APPROVAL | APPROVED | REJECTED",
    "startTime": "datetime",
    "endTime": "datetime",
    "remarks": "string",
    "pump": { "name": "string" },
    "fuelType": { "name": "string", "color": "string" },
    "cashier": { "fullName": "string" }
  }
]
\`\`\`

### POST /api/pump-shifts
**Description:** Start new shift  
**Authentication:** Required (Cashier)  
**Request Body:**
\`\`\`json
{
  "pumpId": "string",
  "attendantName": "string (min 2 chars)",
  "openingReading": "number (positive)"
}
\`\`\`
**Response:** PumpShift object  
**Business Logic:**
- Check if pump already has an open shift
- Get current fuel price for the pump's fuel type
- Set status to OPEN
- Set startTime to current timestamp
- cashierId from JWT token

### PUT /api/pump-shifts/:id
**Description:** Close shift and submit handover  
**Authentication:** Required (Cashier, owner of shift)  
**Request Body:**
\`\`\`json
{
  "closingReading": "number (positive, > openingReading)",
  "cashAmount": "number (non-negative)",
  "cardAmount": "number (non-negative)",
  "creditAmount": "number (non-negative)",
  "remarks": "string (optional)"
}
\`\`\`
**Response:** Updated PumpShift object  
**Business Logic:**
- Validate shift is OPEN
- Validate cashier owns this shift
- Calculate litersSold = closingReading - openingReading
- Calculate expectedAmount = litersSold * pricePerLiter
- Calculate totalReceived = cashAmount + cardAmount + creditAmount
- Calculate difference = totalReceived - expectedAmount
- Set status to PENDING_APPROVAL
- Set endTime to current timestamp
- Update fuel type stock (reduce by litersSold)

### POST /api/pump-shifts/:id/interim
**Description:** Mid-shift cash collection (for security)  
**Authentication:** Required (Cashier, owner of shift)  
**Request Body:**
\`\`\`json
{
  "amount": "number (positive)",
  "collectedAt": "datetime",
  "remarks": "string (optional)"
}
\`\`\`
**Response:**
\`\`\`json
{
  "id": "string",
  "shiftId": "string",
  "amount": "number",
  "collectedAt": "datetime",
  "remarks": "string"
}
\`\`\`
**Business Logic:**
- Validate shift is OPEN
- Create InterimHandover record
- This amount should be deducted when calculating final cash handover

### POST /api/pump-shifts/approve
**Description:** Approve or reject shift handover  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "shiftId": "string",
  "status": "APPROVED | REJECTED",
  "remarks": "string (optional)"
}
\`\`\`
**Response:** Updated PumpShift object  
**Business Logic:**
- Validate shift is PENDING_APPROVAL
- Update status to APPROVED or REJECTED
- Append admin remarks
- If REJECTED, may need to adjust stock

---

## Report APIs

### GET /api/reports/sales
**Description:** Sales report with filters  
**Authentication:** Required  
**Query Parameters:**
\`\`\`
?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&cashierId=string&fuelTypeId=string
\`\`\`
**Response:**
\`\`\`json
{
  "summary": {
    "totalSales": "number",
    "totalLitersSold": "number",
    "totalShifts": "number"
  },
  "byFuelType": [
    {
      "fuelTypeId": "string",
      "fuelTypeName": "string",
      "litersSold": "number",
      "totalAmount": "number",
      "shifts": "number"
    }
  ],
  "byCashier": [
    {
      "cashierId": "string",
      "cashierName": "string",
      "litersSold": "number",
      "totalAmount": "number",
      "shifts": "number"
    }
  ],
  "dailyTrend": [
    {
      "date": "YYYY-MM-DD",
      "totalSales": "number",
      "litersSold": "number"
    }
  ]
}
\`\`\`
**Business Logic:**
- Filter approved shifts by date range
- Aggregate by fuel type and cashier
- Calculate daily trends
- All Decimal fields converted to numbers

### GET /api/reports/fuel-stock
**Description:** Fuel stock report  
**Authentication:** Required  
**Response:**
\`\`\`json
{
  "currentStock": [
    {
      "fuelTypeId": "string",
      "fuelTypeName": "string",
      "color": "string",
      "currentStock": "number",
      "tankCapacity": "number",
      "percentage": "number",
      "status": "critical | low | normal | high"
    }
  ],
  "recentDeliveries": [
    {
      "fuelTypeName": "string",
      "quantity": "number",
      "supplier": "string",
      "deliveryDate": "datetime"
    }
  ],
  "stockMovement": [
    {
      "date": "YYYY-MM-DD",
      "fuelTypeName": "string",
      "opening": "number",
      "delivered": "number",
      "sold": "number",
      "closing": "number"
    }
  ]
}
\`\`\`

---

## Salary Management APIs

### GET /api/salary
**Description:** List salary records with filters  
**Authentication:** Required (Admin only)  
**Query Parameters:**
\`\`\`
?month=1-12&year=YYYY&employeeId=string
\`\`\`
**Response:**
\`\`\`json
[
  {
    "id": "string",
    "employeeId": "string",
    "month": "number (1-12)",
    "year": "number",
    "basicSalary": "number",
    "fullDayLeaves": "number",
    "halfDayLeaves": "number",
    "loanDeduction": "number",
    "leaveDeductions": "number",
    "totalDeductions": "number",
    "netSalary": "number",
    "createdAt": "datetime",
    "employee": {
      "name": "string",
      "position": "string"
    }
  }
]
\`\`\`

### POST /api/salary
**Description:** Create salary record  
**Authentication:** Required (Admin only)  
**Request Body:**
\`\`\`json
{
  "employeeId": "string",
  "month": "number (1-12)",
  "year": "number",
  "basicSalary": "number (positive)",
  "fullDayLeaves": "number (non-negative)",
  "halfDayLeaves": "number (non-negative)",
  "loanDeduction": "number (non-negative)"
}
\`\`\`
**Response:** SalaryRecord object  
**Business Logic:**
- Check for duplicate (same employee, month, year)
- Calculate per day salary = basicSalary / 26 (working days)
- Calculate leave deductions:
  - Full day: fullDayLeaves * perDaySalary
  - Half day: halfDayLeaves * (perDaySalary / 2)
- Calculate totalDeductions = leaveDeductions + loanDeduction
- Calculate netSalary = basicSalary - totalDeductions

### PUT /api/salary/:id
**Description:** Update salary record (recalculate)  
**Authentication:** Required (Admin only)  
**Request Body:** Same as POST (all optional)  
**Response:** Updated SalaryRecord object  
**Business Logic:**
- Recalculate all derived fields
- Same calculation logic as POST

### DELETE /api/salary/:id
**Description:** Delete salary record  
**Authentication:** Required (Admin only)  
**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

---

## Debug/Utility APIs

### GET /api/debug/db-status
**Description:** Check database connection and seeded data  
**Authentication:** None (remove in production)  
**Response:**
\`\`\`json
{
  "database": "connected",
  "counts": {
    "users": "number",
    "employees": "number",
    "fuelTypes": "number",
    "pumps": "number"
  }
}
\`\`\`

---

## Migration Checklist

When migrating to Python backend:

1. **Update Environment Variable**
   \`\`\`bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   \`\`\`

2. **Update API Client** (in `lib/api/endpoints.ts`)
   - Change `API_BASE_URL` to point to Python backend

3. **Test Each Endpoint**
   - Use the API metadata for request/response structure
   - Ensure all calculations match
   - Convert Decimal to float in Python responses

4. **Authentication**
   - Implement JWT token generation with same secret
   - Ensure token expiry matches (7 days)
   - Use same cookie name ('session')

5. **Database**
   - Use same PostgreSQL schema
   - Convert Prisma Decimal to Python Decimal/float
   - Maintain same validation rules

6. **Error Handling**
   - Return same error structure: `{ "error": "message" }`
   - Use same HTTP status codes

7. **CORS Configuration**
   \`\`\`python
   # Allow Next.js frontend
   origins = ["http://localhost:3000", "https://your-domain.com"]
