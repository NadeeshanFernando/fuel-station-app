import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSalaryRecordSchema } from '@/lib/validations'

// GET - Fetch salary records with optional filters
export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)

    const salaryRecords = await prisma.salaryRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    // Convert Decimals to numbers
    const serializedRecords = salaryRecords.map((record) => ({
      ...record,
      basicSalary: Number(record.basicSalary),
      totalSalary: Number(record.totalSalary),
      loanAmount: Number(record.loanAmount),
      totalDeductions: Number(record.totalDeductions),
      netSalary: Number(record.netSalary),
    }))

    return NextResponse.json(serializedRecords)
  } catch (error) {
    console.error('Error fetching salary records:', error)
    return NextResponse.json({ error: 'Failed to fetch salary records' }, { status: 500 })
  }
}

// POST - Create new salary record
export async function POST(req: NextRequest) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createSalaryRecordSchema.parse(body)

    // Calculate deductions
    // Assuming 26 working days per month (excluding Sundays)
    const workingDaysPerMonth = 26
    const perDayDeduction = validatedData.totalSalary / workingDaysPerMonth
    const fullDayDeduction = validatedData.fullDayLeaves * perDayDeduction
    const halfDayDeduction = validatedData.halfDayLeaves * (perDayDeduction / 2)
    const totalDeductions = fullDayDeduction + halfDayDeduction + validatedData.loanAmount
    const netSalary = validatedData.totalSalary - totalDeductions

    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        employeeId: validatedData.employeeId,
        month: validatedData.month,
        year: validatedData.year,
        basicSalary: validatedData.basicSalary,
        totalSalary: validatedData.totalSalary,
        fullDayLeaves: validatedData.fullDayLeaves,
        halfDayLeaves: validatedData.halfDayLeaves,
        loanAmount: validatedData.loanAmount,
        totalDeductions,
        netSalary,
        remarks: validatedData.remarks,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    })

    // Convert Decimals to numbers
    const serializedRecord = {
      ...salaryRecord,
      basicSalary: Number(salaryRecord.basicSalary),
      totalSalary: Number(salaryRecord.totalSalary),
      loanAmount: Number(salaryRecord.loanAmount),
      totalDeductions: Number(salaryRecord.totalDeductions),
      netSalary: Number(salaryRecord.netSalary),
    }

    return NextResponse.json(serializedRecord, { status: 201 })
  } catch (error: any) {
    console.error('Error creating salary record:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Salary record already exists for this employee and month' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message || 'Failed to create salary record' }, { status: 400 })
  }
}
