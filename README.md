# Fuel Station Management System

A complete, production-quality web application for managing fuel station daily operations, including sales tracking, shift management, cash/card handovers, and fuel inventory monitoring.

## Features

- **Role-Based Access Control**: Admin and Cashier roles with different permissions
- **Pump Shift Management**: Track pump shifts with attendant names, meter readings, and cash/card collection
- **Handover Approval System**: Admin approval workflow for shift closures
- **Fuel Stock Tracking**: Daily opening/closing stock with delivery management
- **Visual Fuel Indicators**: Animated tank cylinders showing stock levels
- **Comprehensive Reports**: Daily sales, pump-wise, cashier-wise, and variance reports
- **Clean Professional UI**: Modern interface optimized for business use
- **API Management**: Centralized API management for easy maintenance and migration

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions with bcrypt password hashing

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon already connected to this project)

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment

**Windows (PowerShell):**
\`\`\`powershell
Copy-Item .env.example .env
\`\`\`

**Mac/Linux:**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit the `.env` file and add:
\`\`\`env
DATABASE_URL="your_neon_database_url"
JWT_SECRET="your_secret_key_make_it_long_and_random"
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

The `DATABASE_URL` is available from your Neon integration in the v0 Vars section.

### 4. Initialize Database

Push the Prisma schema to create all tables:

\`\`\`bash
npm run db:push
\`\`\`

**Important:** This creates all database tables including the new tank configuration fields (tankCapacity, minStockAlert, currentStock) on the FuelType model.

### 5. Seed the Database

Run the seed script to create default users and sample data:

\`\`\`bash
npm run db:seed
\`\`\`

This creates:
- Admin user (username: `admin`, password: `admin123`)
- Cashier user (username: `cashier1`, password: `cashier123`)
- Sample fuel types (Petrol 92, Petrol 95, Auto Diesel, Super Diesel) with colors
- 6 sample pumps assigned to fuel types
- Initial fuel stock for today

**Verify the seed was successful:**

After seeding, start the dev server and visit:
\`\`\`
http://localhost:3000/api/debug/db-status
\`\`\`

This will show you the database status and confirm users were created.

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Cashier Account:**
- Username: `cashier1`
- Password: `cashier123`

**⚠️ Change these credentials in production!**

## Project Structure

\`\`\`
/app                  # Next.js App Router pages
  /api               # API routes
  /admin             # Admin-only pages
  /cashier           # Cashier-only pages
/components          # React components
  /ui                # shadcn/ui components
/lib                 # Utilities and helpers
  auth.ts            # Authentication utilities
  db.ts              # Prisma client singleton
  validations.ts     # Zod validation schemas
  api                # Centralized API client and endpoints
/prisma              # Database schema
  schema.prisma      # Prisma models
/scripts             # Database scripts
  seed.ts            # TypeScript seed script
/docs                # Documentation for API endpoints and migration guide
  API_REGISTRY.md    # Complete endpoint registry with detailed schemas
  PYTHON_API_MIGRATION_GUIDE.md # FastAPI implementation with code examples
\`\`\`

## Key Features Explained

### Authentication
- JWT-based session management with httpOnly cookies
- Bcrypt password hashing for security
- Server-side authentication checks on pages and API routes

### Pump Shifts
- Cashiers start shifts with opening meter reading
- Close shifts with closing reading and cash/card amounts
- System calculates liters sold, expected amount, and variance
- Shifts require admin approval before being finalized

### Stock Management
- Daily opening stock entry per fuel type
- Record fuel deliveries with quantity and invoice details
- Daily closing physical stock measurement
- Automatic variance calculation (expected vs actual)

### Reports
- Daily sales summary with totals by fuel type
- Cash vs card vs credit breakdown
- Pump-wise and cashier-wise performance reports
- Stock variance analysis

### API Client Usage

Instead of using `fetch` directly, use the centralized API client:

\`\`\`typescript
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

// GET request
const employees = await apiClient.get(API_ENDPOINTS.employees.list)

// POST request
const newEmployee = await apiClient.post(API_ENDPOINTS.employees.create, {
  name: 'John Doe',
  position: 'Pump Attendant',
  contactNumber: '1234567890',
  basicSalary: 25000
})

// PUT request
const updated = await apiClient.put(
  API_ENDPOINTS.employees.update('employee-id'),
  { basicSalary: 30000 }
)

// DELETE request
await apiClient.delete(API_ENDPOINTS.employees.delete('employee-id'))
\`\`\`

### Migrating to Python Backend

1. Set environment variable in the Vars section of the v0 sidebar or in your `.env` file:
   \`\`\`bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   \`\`\`

2. All API calls will automatically use the new base URL

3. Refer to `docs/API_REGISTRY.md` for complete endpoint documentation with request/response schemas

4. See `docs/PYTHON_API_MIGRATION_GUIDE.md` for detailed Python implementation guide with FastAPI examples

## Development

- **Prisma Studio**: `npm run db:studio` - Visual database editor
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint configuration included

## Useful Commands

\`\`\`bash
npm run dev          # Start development server
npm run db:studio    # Open database GUI
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run build        # Build for production
npm run start        # Run production build
\`\`\`

## Production Deployment

1. Update `JWT_SECRET` in environment variables
2. Use a production PostgreSQL database
3. Change default user passwords
4. Enable HTTPS for secure cookie transmission
5. Set `NODE_ENV=production`

## Troubleshooting

**Foreign Key Constraint Error:**
- This usually means the database wasn't seeded properly
- Run `npm run db:seed` to create users and initial data
- Verify at `http://localhost:3000/api/debug/db-status`
- You should see 2 users (admin and cashier1) in the response

**Windows Issues:**
- If PowerShell scripts are blocked, run PowerShell as Administrator and execute: `Set-ExecutionPolicy RemoteSigned`
- Make sure Node.js and npm are in your PATH

**Database Connection:**
- Ensure your Neon database URL is correctly set in `.env`
- Check that your IP is allowed in Neon's firewall settings
- Verify the connection using `npm run db:studio`

**Seed Script Issues:**
- Ensure `npm install` completed successfully
- Make sure `npm run db:push` ran before seeding
- Check database connection with Prisma Studio

## License

Private - All rights reserved
