import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateSalaryRecordSchema } from '@/lib/validations'

// PUT - Update salary record
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateSalaryRecordSchema.parse(body)

    // Fetch existing record
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: { id: params.id },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
    }

    // Recalculate deductions
    const workingDaysPerMonth = 26
    const totalSalary = validatedData.totalSalary ?? Number(existingRecord.totalSalary)
    const perDayDeduction = totalSalary / workingDaysPerMonth
    const fullDayLeaves = validatedData.fullDayLeaves ?? existingRecord.fullDayLeaves
    const halfDayLeaves = validatedData.halfDayLeaves ?? existingRecord.halfDayLeaves
    const loanAmount = validatedData.loanAmount ?? Number(existingRecord.loanAmount)

    const fullDayDeduction = fullDayLeaves * perDayDeduction
    const halfDayDeduction = halfDayLeaves * (perDayDeduction / 2)
    const totalDeductions = fullDayDeduction + halfDayDeduction + loanAmount
    const netSalary = totalSalary - totalDeductions

    const updatedRecord = await prisma.salaryRecord.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        totalDeductions,
        netSalary,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    // Convert Decimals to numbers
    const serializedRecord = {
      ...updatedRecord,
      basicSalary: Number(updatedRecord.basicSalary),
      totalSalary: Number(updatedRecord.totalSalary),
      loanAmount: Number(updatedRecord.loanAmount),
      totalDeductions: Number(updatedRecord.totalDeductions),
      netSalary: Number(updatedRecord.netSalary),
    }

    return NextResponse.json(serializedRecord)
  } catch (error: any) {
    console.error('Error updating salary record:', error)
    return NextResponse.json({ error: error.message || 'Failed to update salary record' }, { status: 400 })
  }
}

// DELETE - Delete salary record
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.salaryRecord.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Salary record deleted successfully' })
  } catch (error) {
    console.error('Error deleting salary record:', error)
    return NextResponse.json({ error: 'Failed to delete salary record' }, { status: 500 })
  }
}
