import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { createEmployeeSchema } from '@/lib/validations'

// GET /api/employees - Get all employees
export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive')

    const employees = await db.employee.findMany({
      where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    // Convert Decimal to number for JSON serialization
    const serializedEmployees = employees.map((emp) => ({
      ...emp,
      basicSalary: Number(emp.basicSalary),
    }))

    return NextResponse.json(serializedEmployees)
  } catch (error: any) {
    console.error('[v0] Error fetching employees:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/employees - Create new employee
export async function POST(req: NextRequest) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createEmployeeSchema.parse(body)

    const employee = await db.employee.create({
      data: {
        name: validated.name,
        position: validated.position,
        phoneNumber: validated.phoneNumber,
        address: validated.address,
        joinDate: validated.joinDate ? new Date(validated.joinDate) : new Date(),
        basicSalary: validated.basicSalary,
      },
    })

    // Convert Decimal to number for JSON serialization
    const serializedEmployee = {
      ...employee,
      basicSalary: Number(employee.basicSalary),
    }

    return NextResponse.json(serializedEmployee, { status: 201 })
  } catch (error: any) {
    console.error('[v0] Error creating employee:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
