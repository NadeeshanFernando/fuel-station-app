// GET /api/fuel-types - List all fuel types
// POST /api/fuel-types - Create new fuel type (admin only)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { createFuelTypeSchema } from '@/lib/validations'

export async function GET() {
  try {
    const fuelTypes = await prisma.fuelType.findMany({
      include: {
        priceHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const formattedFuelTypes = fuelTypes.map((ft) => ({
      id: ft.id,
      name: ft.name,
      color: ft.color,
      tankCapacity: Number(ft.tankCapacity),
      minStockAlert: Number(ft.minStockAlert),
      currentStock: Number(ft.currentStock),
      isActive: ft.isActive,
      currentPrice: ft.priceHistory[0] ? Number(ft.priceHistory[0].pricePerLiter) : null,
      createdAt: ft.createdAt,
    }))

    return NextResponse.json({ fuelTypes: formattedFuelTypes })
  } catch (error) {
    console.error('Get fuel types error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = createFuelTypeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, color, tankCapacity, minStockAlert } = validation.data

    // Check if fuel type already exists
    const existing = await prisma.fuelType.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Fuel type already exists' },
        { status: 400 }
      )
    }

    const fuelType = await prisma.fuelType.create({
      data: { 
        name,
        color: color || '#3b82f6',
        tankCapacity: tankCapacity || 10000,
        minStockAlert: minStockAlert || 1000,
        currentStock: 0,
      },
    })

    return NextResponse.json({ fuelType }, { status: 201 })
  } catch (error: any) {
    console.error('Create fuel type error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create fuel type' },
      { status: 500 }
    )
  }
}
