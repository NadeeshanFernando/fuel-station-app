// GET /api/fuel-stock/opening - Get opening stock records
// POST /api/fuel-stock/opening - Set opening stock (admin)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { setOpeningStockSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const where: any = {}
    if (date) {
      where.date = new Date(date)
    }

    const stocks = await prisma.fuelDailyStock.findMany({
      where,
      include: {
        fuelType: true,
      },
      orderBy: [
        { date: 'desc' },
        { fuelType: { name: 'asc' } },
      ],
    })

    return NextResponse.json({ stocks })
  } catch (error) {
    console.error('Get opening stock error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opening stock' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = setOpeningStockSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { date, fuelTypeId, openingStockLiters } = validation.data
    const stockDate = new Date(date)
    stockDate.setHours(0, 0, 0, 0)

    // Upsert opening stock
    const stock = await prisma.fuelDailyStock.upsert({
      where: {
        date_fuelTypeId: {
          date: stockDate,
          fuelTypeId,
        },
      },
      update: {
        openingStockLiters,
      },
      create: {
        date: stockDate,
        fuelTypeId,
        openingStockLiters,
      },
      include: {
        fuelType: true,
      },
    })

    return NextResponse.json({ stock })
  } catch (error: any) {
    console.error('Set opening stock error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set opening stock' },
      { status: 500 }
    )
  }
}
