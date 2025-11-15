import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/fuel-stock/view - Get all fuel tanks with current stock levels
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tanks = await db.fuelType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        tankCapacity: true,
        minStockAlert: true,
        currentStock: true,
      },
      orderBy: { name: 'asc' },
    })

    // Convert Decimal to number
    const serializedTanks = tanks.map((tank) => ({
      id: tank.id,
      name: tank.name,
      color: tank.color,
      tankCapacity: Number(tank.tankCapacity),
      minStockAlert: Number(tank.minStockAlert),
      currentStock: Number(tank.currentStock),
    }))

    return NextResponse.json({ tanks: serializedTanks })
  } catch (error) {
    console.error('[v0] Error fetching fuel stock:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel stock' },
      { status: 500 }
    )
  }
}
