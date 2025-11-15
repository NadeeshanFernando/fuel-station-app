// GET /api/pump-shifts/[id] - Get single shift
// PATCH /api/pump-shifts/[id] - Close shift (cashier)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { closeShiftSchema } from '@/lib/validations'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params

    const shift = await prisma.pumpShift.findUnique({
      where: { id },
      include: {
        pump: true,
        fuelType: true,
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ shift })
  } catch (error: any) {
    console.error('Get shift error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shift' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()

    // Only cashiers can close shifts
    if (session.role !== 'CASHIER') {
      return NextResponse.json(
        { error: 'Only cashiers can close shifts' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = closeShiftSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { closingReading, cashAmount, cardAmount, creditAmount, remarks } = validation.data

    // Get shift and verify ownership
    const shift = await prisma.pumpShift.findUnique({
      where: { id },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    if (shift.cashierId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only close your own shifts' },
        { status: 403 }
      )
    }

    if (shift.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Shift is not open' },
        { status: 400 }
      )
    }

    // Validate closing reading
    if (closingReading < Number(shift.openingReading)) {
      return NextResponse.json(
        { error: 'Closing reading cannot be less than opening reading' },
        { status: 400 }
      )
    }

    // Calculate liters sold and amounts
    const litersSold = new Decimal(closingReading).minus(shift.openingReading)
    const expectedAmount = litersSold.times(shift.pricePerLiter)
    const totalCollected = new Decimal(cashAmount)
      .plus(cardAmount)
      .plus(creditAmount || 0)
    const difference = expectedAmount.minus(totalCollected)

    // Update shift
    const updatedShift = await prisma.pumpShift.update({
      where: { id },
      data: {
        closingReading,
        litersSold,
        expectedAmount,
        cashAmount,
        cardAmount,
        creditAmount,
        difference,
        remarks,
        status: 'PENDING_APPROVAL',
        endTime: new Date(),
      },
      include: {
        pump: true,
        fuelType: true,
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json({ shift: updatedShift })
  } catch (error: any) {
    console.error('Close shift error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to close shift' },
      { status: 500 }
    )
  }
}
