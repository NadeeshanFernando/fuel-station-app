# Developer Guide

## Welcome to Fuel Station Management System

This guide will help you understand, maintain, and extend the codebase effectively.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
\`\`\`

## Project Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **UI Components**: shadcn/ui with Radix UI

### Design Patterns

1. **Repository Pattern**: Database access through Prisma
2. **Service Layer**: Business logic in utility functions
3. **MVC Pattern**: Models (Prisma), Views (Components), Controllers (API Routes)

## Common Tasks

### Adding a New Feature

Example: Adding a "Maintenance Log" feature

1. **Define Database Schema**

\`\`\`prisma
// prisma/schema.prisma
model MaintenanceLog {
  id        String   @id @default(cuid())
  pumpId    String
  date      DateTime
  issue     String
  resolved  Boolean  @default(false)
  cost      Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  
  pump      Pump     @relation(fields: [pumpId], references: [id])
}
\`\`\`

2. **Define Types**

\`\`\`typescript
// src/types/index.ts
export interface MaintenanceLog {
  id: string;
  pumpId: string;
  date: Date;
  issue: string;
  resolved: boolean;
  cost: number;
  createdAt: Date;
  pump?: Pump;
}

export interface CreateMaintenanceLogInput {
  pumpId: string;
  date: Date;
  issue: string;
  cost: number;
}
\`\`\`

3. **Add Validation Schema**

\`\`\`typescript
// src/lib/validations.ts
export const createMaintenanceLogSchema = z.object({
  pumpId: z.string(),
  date: z.date(),
  issue: z.string().min(5),
  cost: z.number().positive(),
});
\`\`\`

4. **Create API Routes**

\`\`\`typescript
// app/api/maintenance/route.ts
export async function GET(request: Request) {
  // Implementation
}

export async function POST(request: Request) {
  // Implementation
}
\`\`\`

5. **Add to API Client**

\`\`\`typescript
// src/lib/api/endpoints.ts
export const API_ENDPOINTS = {
  // ... existing
  maintenance: {
    list: '/api/maintenance',
    create: '/api/maintenance',
    // ...
  }
};
\`\`\`

6. **Build UI Components**

\`\`\`typescript
// components/maintenance/maintenance-table.tsx
// components/maintenance/create-maintenance-dialog.tsx
\`\`\`

7. **Create Page**

\`\`\`typescript
// app/admin/maintenance/page.tsx
\`\`\`

### Updating an Existing Feature

1. **Locate the feature domain** (e.g., `employees`, `shifts`)
2. **Update types** in `src/types/index.ts` if data structure changes
3. **Update validation** in `src/lib/validations.ts` if rules change
4. **Modify API routes** in `app/api/[feature]/`
5. **Update UI components** in `components/[feature]/`
6. **Test thoroughly**

### Adding a New Calculation

All business logic calculations should go in `src/lib/utils/calculations.ts`:

\`\`\`typescript
/**
 * Calculate overtime pay
 */
export function calculateOvertimePay(
  hourlyRate: number,
  overtimeHours: number,
  multiplier: number = 1.5
): number {
  return hourlyRate * overtimeHours * multiplier;
}
\`\`\`

## Code Style Guide

### TypeScript Best Practices

\`\`\`typescript
// ✅ DO: Use explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ DON'T: Use any
function calculateTotal(items: any): any {
  // ...
}

// ✅ DO: Use const for immutable values
const MAX_RETRIES = 3;

// ❌ DON'T: Use let when const is appropriate
let MAX_RETRIES = 3;

// ✅ DO: Use optional chaining
const name = employee?.name ?? 'Unknown';

// ❌ DON'T: Use nested ternaries
const name = employee ? employee.name : 'Unknown';
\`\`\`

### React Best Practices

\`\`\`typescript
// ✅ DO: Extract complex logic to custom hooks
function useEmployeeData(id: string) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  // ... logic
  return employee;
}

// ✅ DO: Use meaningful component names
function EmployeeProfileCard() { /* ... */ }

// ❌ DON'T: Use generic names
function Card1() { /* ... */ }

// ✅ DO: Keep components small and focused
function EmployeeAvatar({ url }: { url: string }) {
  return <img src={url || "/placeholder.svg"} className="rounded-full" />;
}

// ❌ DON'T: Create monolithic components
function EmployeeEverything() {
  // 500 lines of mixed concerns
}
\`\`\`

### API Route Best Practices

\`\`\`typescript
// ✅ DO: Validate input
export async function POST(request: Request) {
  const body = await request.json();
  const validated = createEmployeeSchema.parse(body);
  // ... use validated data
}

// ✅ DO: Handle errors properly
try {
  const result = await db.employee.create({ data });
  return Response.json({ data: result });
} catch (error) {
  console.error('[API Error]', error);
  return Response.json({ error: 'Failed to create' }, { status: 500 });
}

// ✅ DO: Use consistent response format
return Response.json({
  data: result,
  message: 'Success'
});
\`\`\`

## Testing Guidelines

### Unit Testing Example

\`\`\`typescript
// src/lib/utils/__tests__/calculations.test.ts
import { calculateNetSalary } from '../calculations';

describe('calculateNetSalary', () => {
  it('should calculate correct net salary', () => {
    const result = calculateNetSalary(26000, 2, 1, 1000);
    expect(result).toBe(23500); // Adjust based on actual calculation
  });
  
  it('should not return negative salary', () => {
    const result = calculateNetSalary(10000, 20, 10, 50000);
    expect(result).toBe(0);
  });
});
\`\`\`

## Debugging

### Common Issues

**Problem**: "Cannot read property of undefined"
**Solution**: Use optional chaining `obj?.prop` or check existence first

**Problem**: API returns 401 Unauthorized
**Solution**: Check if token exists in cookies and is valid

**Problem**: Prisma query fails
**Solution**: Check schema, run `npm run db:push`, verify database connection

### Debug Tools

\`\`\`typescript
// Add temporary debug logging
console.log('[v0 DEBUG] Employee data:', employee);
console.log('[v0 DEBUG] API response:', response);

// Check database with Prisma Studio
// npm run db:studio

// Inspect API responses in Network tab
// Chrome DevTools > Network > Select request > Preview
\`\`\`

## Performance Tips

1. **Use React Server Components** for data fetching
2. **Implement pagination** for large lists
3. **Add loading states** with Suspense
4. **Optimize images** with next/image
5. **Use memoization** for expensive calculations
6. **Index database columns** used in WHERE clauses

## Security Checklist

- [ ] Always validate user input
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Check authentication in API routes
- [ ] Validate user permissions
- [ ] Sanitize error messages (don't expose internals)
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Log security events

## Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use production database
- [ ] Enable database connection pooling
- [ ] Set NODE_ENV=production
- [ ] Configure CORS if needed
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backups
- [ ] Test all critical paths

## Getting Help

1. **Check documentation** in `docs/` folder
2. **Read error messages** carefully
3. **Use browser DevTools** for debugging
4. **Review Prisma logs** for database issues
5. **Check API documentation** in `docs/API_REGISTRY.md`

## Contributing

When adding new code:

1. Follow existing patterns and conventions
2. Add JSDoc comments for complex functions
3. Update type definitions
4. Update documentation
5. Test your changes thoroughly
6. Keep components small and focused

## Useful Commands

\`\`\`bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:push            # Push schema changes
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Seed database

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # Check TypeScript (if configured)
\`\`\`

## Resources

- Project Structure: `docs/PROJECT_STRUCTURE.md`
- API Documentation: `docs/API_REGISTRY.md`
- Python Migration: `docs/PYTHON_API_MIGRATION_GUIDE.md`
- Responsive Design: `docs/RESPONSIVE_DESIGN.md`
