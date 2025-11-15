"""
FastAPI Application Entry Point
Complete example showing app initialization and route registration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.routes import (
    auth,
    users,
    employees,
    fuel_types,
    pumps,
    shifts,
    salary,
    fuel_stock,
    reports
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Fuel Station Management API",
    description="Complete REST API for fuel station operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(fuel_types.router, prefix="/api/fuel-types", tags=["Fuel Types"])
app.include_router(pumps.router, prefix="/api/pumps", tags=["Pumps"])
app.include_router(shifts.router, prefix="/api/pump-shifts", tags=["Pump Shifts"])
app.include_router(salary.router, prefix="/api/salary", tags=["Salary"])
app.include_router(fuel_stock.router, prefix="/api/fuel-stock", tags=["Fuel Stock"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Fuel Station Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
