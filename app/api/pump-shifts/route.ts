// GET /api/pump-shifts - List pump shifts with filters
// POST /api/pump-shifts - Start new shift (cashier)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { startShiftSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const cashierId = searchParams.get('cashierId')
    const pumpId = searchParams.get('pumpId')
    const date = searchParams.get('date')

    const where: any = {}
    
    // Cashiers can only see their own shifts
    if (session.role === 'CASHIER') {
      where.cashierId = session.userId
    } else if (cashierId) {
      where.cashierId = cashierId
    }

    if (status) {
      where.status = status
    }

    if (pumpId) {
      where.pumpId = pumpId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.startTime = {
        gte: startDate,
        lte: endDate,
      }
    }

    const shifts = await prisma.pumpShift.findMany({
      where,
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
      orderBy: {
        startTime: 'desc',
      },
    })

    return NextResponse.json({ shifts })
  } catch (error: any) {
    console.error('Get shifts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Only cashiers can start shifts
    if (session.role !== 'CASHIER') {
      return NextResponse.json(
        { error: 'Only cashiers can start shifts' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = startShiftSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { pumpId, attendantName, openingReading } = validation.data

    const cashier = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!cashier) {
      console.error('[v0] Cashier not found in database:', session.userId)
      return NextResponse.json(
        { error: 'Cashier account not found. Please contact admin.' },
        { status: 404 }
      )
    }

    // Get pump details and current fuel price
    const pump = await prisma.pump.findUnique({
      where: { id: pumpId },
      include: {
        fuelType: {
          include: {
            priceHistory: {
              where: { effectiveTo: null },
              take: 1,
            },
          },
        },
      },
    })

    if (!pump) {
      return NextResponse.json(
        { error: 'Pump not found' },
        { status: 404 }
      )
    }

    if (!pump.isActive) {
      return NextResponse.json(
        { error: 'Pump is inactive' },
        { status: 400 }
      )
    }

    const currentPrice = pump.fuelType.priceHistory[0]

    if (!currentPrice) {
      return NextResponse.json(
        { error: 'No price set for this fuel type' },
        { status: 400 }
      )
    }

    // Check if there's already an open shift for this pump
    const existingOpenShift = await prisma.pumpShift.findFirst({
      where: {
        pumpId,
        status: 'OPEN',
      },
    })

    if (existingOpenShift) {
      return NextResponse.json(
        { error: 'This pump already has an open shift' },
        { status: 400 }
      )
    }

    // Create new shift
    const shift = await prisma.pumpShift.create({
      data: {
        pumpId,
        fuelTypeId: pump.fuelTypeId,
        cashierId: session.userId,
        attendantName,
        openingReading,
        pricePerLiter: currentPrice.pricePerLiter,
        status: 'OPEN',
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

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error: any) {
    console.error('[v0] Start shift error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start shift' },
      { status: 500 }
    )
  }
}
