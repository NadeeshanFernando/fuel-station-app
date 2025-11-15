# Project Structure Guide

## Overview

This document explains the folder structure and organization of the Fuel Station Management System. The project follows industry best practices for maintainability, scalability, and developer experience.

## Directory Structure

\`\`\`
fuel-station-management/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── employees/            # Employee CRUD endpoints
│   │   ├── fuel-types/           # Fuel type management endpoints
│   │   ├── fuel-stock/           # Stock management endpoints
│   │   ├── pump-shifts/          # Shift management endpoints
│   │   ├── pumps/                # Pump CRUD endpoints
│   │   ├── reports/              # Reporting endpoints
│   │   ├── salary/               # Salary calculation endpoints
│   │   └── users/                # User management endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── cashier/                  # Cashier dashboard pages
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/redirect page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard widgets
│   ├── employees/                # Employee management UI
│   ├── fuel-stock/               # Stock management UI
│   ├── fuel-types/               # Fuel type management UI
│   ├── handovers/                # Handover approval UI
│   ├── layout/                   # Layout components (sidebar, header)
│   ├── pumps/                    # Pump management UI
│   ├── reports/                  # Reporting UI
│   ├── salary/                   # Salary calculator UI
│   ├── shifts/                   # Shift management UI
│   ├── ui/                       # Reusable UI components (shadcn)
│   └── users/                    # User management UI
├── src/                          # Source code organization
│   ├── config/                   # Configuration files
│   │   └── constants.ts          # All constant values
│   ├── lib/                      # Core libraries
│   │   ├── api/                  # API client and endpoints
│   │   │   ├── client.ts         # HTTP client with auth
│   │   │   └── endpoints.ts      # API endpoint definitions
│   │   ├── utils/                # Utility functions
│   │   │   ├── calculations.ts   # Business logic calculations
│   │   │   └── date.ts           # Date manipulation helpers
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── db.ts                 # Database client
│   │   └── validations.ts        # Zod validation schemas
│   └── types/                    # TypeScript type definitions
│       └── index.ts              # All application types
├── lib/                          # Legacy lib folder (to be migrated)
├── prisma/                       # Database
│   └── schema.prisma             # Prisma database schema
├── scripts/                      # Utility scripts
│   └── seed.ts                   # Database seeding
├── docs/                         # Documentation
│   ├── API_REGISTRY.md           # Complete API documentation
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── PYTHON_API_MIGRATION_GUIDE.md  # Python migration guide
│   └── RESPONSIVE_DESIGN.md      # Responsive design guidelines
├── .env.example                  # Environment variables template
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project README
\`\`\`

## Key Principles

### 1. Separation of Concerns

- **Components**: UI rendering only, no business logic
- **API Routes**: Request handling and database operations
- **Utils**: Reusable business logic and calculations
- **Types**: Centralized type definitions
- **Constants**: All magic numbers and configuration values

### 2. Single Source of Truth

- All types in `src/types/index.ts`
- All constants in `src/config/constants.ts`
- All API endpoints in `src/lib/api/endpoints.ts`
- All validations in `src/lib/validations.ts`

### 3. DRY (Don't Repeat Yourself)

- Calculation logic extracted to pure functions
- Reusable UI components in `components/ui/`
- Shared utilities in `src/lib/utils/`

### 4. Clear Naming Conventions

- Components: PascalCase (e.g., `CreateEmployeeDialog.tsx`)
- Files: kebab-case (e.g., `employee-table.tsx`)
- Functions: camelCase (e.g., `calculateNetSalary`)
- Constants: UPPER_SNAKE_CASE (e.g., `WORKING_DAYS_PER_MONTH`)
- Types/Interfaces: PascalCase (e.g., `Employee`, `CreateEmployeeInput`)

## Component Organization

### Feature-Based Structure

Components are organized by feature/domain:

\`\`\`
components/
├── employees/           # All employee-related components
│   ├── employees-table.tsx
│   ├── create-employee-dialog.tsx
│   └── edit-employee-dialog.tsx
├── shifts/              # All shift-related components
│   ├── start-shift-form.tsx
│   ├── close-shift-dialog.tsx
│   └── shifts-history-table.tsx
\`\`\`

### Component Guidelines

1. **One component per file**
2. **Export component at bottom**
3. **Group related components in folders**
4. **Use descriptive names**
5. **Keep components focused (Single Responsibility)**

## API Organization

### Route Structure

APIs follow REST conventions:

- `GET /api/employees` - List all
- `GET /api/employees/[id]` - Get one
- `POST /api/employees` - Create
- `PUT /api/employees/[id]` - Update
- `DELETE /api/employees/[id]` - Delete

### Centralized API Client

All API calls go through `src/lib/api/client.ts`:

\`\`\`typescript
import { apiClient } from '@/src/lib/api/client';

// Automatically handles auth, errors, and base URL
const employees = await apiClient.get('/api/employees');
\`\`\`

## Type System

### Type Definition Strategy

- **Interfaces for objects** (e.g., `Employee`, `PumpShift`)
- **Types for unions** (e.g., `UserRole`, `ShiftStatus`)
- **Input types for API requests** (e.g., `CreateEmployeeInput`)
- **Response types for API responses** (e.g., `ApiResponse<T>`)

### Example Type Hierarchy

\`\`\`typescript
// Base entity
interface Employee {
  id: string;
  name: string;
  // ... all fields
}

// Creation input (no id, no timestamps)
interface CreateEmployeeInput {
  name: string;
  // ... required fields only
}

// Update input (all optional except id)
interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  isActive?: boolean;
}
\`\`\`

## State Management

### Current Approach

- **React useState** for local component state
- **Props drilling** for simple parent-child communication
- **URL params** for filters and pagination

### For Complex State (Future)

Consider adding:
- **Context API** for global state (user session)
- **React Query/SWR** for server state caching
- **Zustand** for complex client state

## Styling Approach

### Tailwind CSS v4

- Utility-first approach
- Semantic design tokens in `globals.css`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Dark/light theme via CSS variables

### Component Styling

\`\`\`typescript
// Use semantic classes
<div className="bg-background text-foreground" />

// Use responsive utilities
<div className="flex flex-col md:flex-row" />

// Use clsx for conditional classes
import { cn } from '@/lib/utils';
<div className={cn("base-class", isActive && "active-class")} />
\`\`\`

## Testing Strategy (Future)

Recommended setup:

- **Unit tests**: Jest + React Testing Library
- **Integration tests**: Playwright
- **E2E tests**: Playwright
- **API tests**: Supertest or built-in Next.js API testing

## Performance Optimization

### Current Optimizations

- React Server Components for data fetching
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Font optimization with next/font

### Best Practices

- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries
- Implement proper caching strategies
- Optimize database queries

## Security Considerations

- JWT authentication with httpOnly cookies
- CSRF protection via tokens
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection via React's escaping

## Migration from Legacy Structure

To fully migrate to new structure:

1. Move `lib/auth.ts` → `src/lib/auth.ts`
2. Move `lib/db.ts` → `src/lib/db.ts`
3. Move `lib/validations.ts` → `src/lib/validations.ts`
4. Update all imports
5. Run tests to ensure nothing breaks

## Adding New Features

### Step-by-Step Guide

1. **Define types** in `src/types/index.ts`
2. **Add constants** in `src/config/constants.ts`
3. **Create validation schema** in `src/lib/validations.ts`
4. **Add API endpoint** in `src/lib/api/endpoints.ts`
5. **Create API route** in `app/api/[feature]/route.ts`
6. **Build UI components** in `components/[feature]/`
7. **Create page** in `app/admin/[feature]/page.tsx`
8. **Update documentation** in `docs/`

## Debugging Tips

1. Use `console.log("[v0] message")` for debugging
2. Check Network tab for API calls
3. Use Prisma Studio to inspect database
4. Check browser console for errors
5. Use `/api/debug/db-status` for database verification

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
