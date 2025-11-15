# Quick Start: Running Python Backend Locally

Get your Python backend running in 5 minutes!

## Prerequisites

- Python 3.11+ installed
- PostgreSQL database (use same Neon database as Next.js)
- Node.js project already set up

## Step-by-Step

### 1. Create Python Project Folder

\`\`\`bash
# In your project root, create a new folder
mkdir fuel-station-api
cd fuel-station-api
\`\`\`

### 2. Copy Python Examples

Copy the example files from `docs/python_examples/`:

\`\`\`bash
# Create folder structure
mkdir -p app/api/routes app/core app/models app/schemas app/utils

# Copy main files
cp ../docs/python_examples/main.py app/
cp ../docs/python_examples/database.py app/core/
cp ../docs/python_examples/requirements.txt .
\`\`\`

### 3. Install Dependencies

\`\`\`bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
\`\`\`

### 4. Configure Environment

Create `.env` file:

\`\`\`env
DATABASE_URL=your_neon_database_url_from_nextjs_env
JWT_SECRET=your_jwt_secret_from_nextjs_env
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
\`\`\`

### 5. Implement One Endpoint (Test)

Create `app/api/routes/auth.py`:

\`\`\`python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import verify_password, create_access_token
from app.core.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
    db = get_db()
    user = db.execute(
        "SELECT * FROM \"User\" WHERE username = %s", 
        (data.username,)
    ).fetchone()
    
    if not user or not verify_password(data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"userId": user['id'], "role": user['role']})
    return {"token": token, "user": {"id": user['id'], "username": user['username'], "role": user['role']}}
\`\`\`

### 6. Run Server

\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

### 7. Test It!

Open browser: `http://localhost:8000/docs`

You should see Swagger API documentation!

Test login:
\`\`\`bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
\`\`\`

### 8. Connect Frontend

In your Next.js project `.env`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

Restart Next.js:
\`\`\`bash
npm run dev
\`\`\`

Try logging in at `http://localhost:3000` - it now uses Python backend!

## Next Steps

1. Implement remaining 34 endpoints following patterns in `docs/PYTHON_API_MIGRATION_GUIDE.md`
2. Test each endpoint at `http://localhost:8000/docs`
3. Update frontend environment variable for production deployment

## File Structure Reference

\`\`\`
fuel-station-api/
├── app/
│   ├── main.py                    # ✅ START HERE
│   ├── core/
│   │   ├── database.py            # Database connection
│   │   └── security.py            # JWT & passwords
│   ├── api/routes/
│   │   ├── auth.py                # Login/logout
│   │   ├── employees.py           # Employee CRUD
│   │   ├── fuel_types.py          # Fuel types
│   │   ├── pumps.py               # Pumps
│   │   ├── shifts.py              # Shift management
│   │   ├── salary.py              # Salary calculator
│   │   ├── fuel_stock.py          # Stock management
│   │   └── reports.py             # Reports
│   ├── models/                    # SQLAlchemy models
│   └── schemas/                   # Pydantic schemas
├── .env
└── requirements.txt
\`\`\`

Done! Your Python backend is running! 🚀
