import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { updateEmployeeSchema } from '@/lib/validations'

// PUT /api/employees/[id] - Update employee
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = updateEmployeeSchema.parse(body)

    const employee = await db.employee.update({
      where: { id: params.id },
      data: validated,
    })

    // Convert Decimal to number for JSON serialization
    const serializedEmployee = {
      ...employee,
      basicSalary: Number(employee.basicSalary),
    }

    return NextResponse.json(serializedEmployee)
  } catch (error: any) {
    console.error('[v0] Error updating employee:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.employee.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Error deleting employee:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
