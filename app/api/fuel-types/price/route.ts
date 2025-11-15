// POST /api/fuel-types/price - Update fuel price (admin only)
// Creates new price history entry and closes previous one
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { updateFuelPriceSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = updateFuelPriceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { fuelTypeId, pricePerLiter } = validation.data

    // Use transaction to update price history
    const result = await prisma.$transaction(async (tx) => {
      // Close current price (set effectiveTo to now)
      await tx.fuelPriceHistory.updateMany({
        where: {
          fuelTypeId,
          effectiveTo: null,
        },
        data: {
          effectiveTo: new Date(),
        },
      })

      // Create new price history entry
      const newPrice = await tx.fuelPriceHistory.create({
        data: {
          fuelTypeId,
          pricePerLiter,
          effectiveFrom: new Date(),
        },
      })

      return newPrice
    })

    return NextResponse.json({ priceHistory: result })
  } catch (error: any) {
    console.error('Update fuel price error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update price' },
      { status: 500 }
    )
  }
}
