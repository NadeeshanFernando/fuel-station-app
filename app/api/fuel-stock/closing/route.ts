// POST /api/fuel-stock/closing - Set closing physical stock (admin)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { setClosingStockSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = setClosingStockSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { date, fuelTypeId, closingPhysicalStockLiters } = validation.data
    const stockDate = new Date(date)
    stockDate.setHours(0, 0, 0, 0)

    // Update closing stock
    const stock = await prisma.fuelDailyStock.update({
      where: {
        date_fuelTypeId: {
          date: stockDate,
          fuelTypeId,
        },
      },
      data: {
        closingPhysicalStockLiters,
      },
      include: {
        fuelType: true,
      },
    })

    return NextResponse.json({ stock })
  } catch (error: any) {
    console.error('Set closing stock error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set closing stock' },
      { status: 500 }
    )
  }
}
