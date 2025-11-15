// POST /api/pump-shifts/approve - Approve or reject a shift (admin only)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { approveShiftSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = approveShiftSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { shiftId, status } = body

    // Get shift
    const shift = await prisma.pumpShift.findUnique({
      where: { id: shiftId },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    if (shift.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Shift is not pending approval' },
        { status: 400 }
      )
    }

    // Update shift status
    const updatedShift = await prisma.pumpShift.update({
      where: { id: shiftId },
      data: {
        status,
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
    console.error('Approve shift error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve shift' },
      { status: 500 }
    )
  }
}
