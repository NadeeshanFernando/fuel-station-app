// GET /api/pumps - List all pumps
// POST /api/pumps - Create new pump (admin only)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { createPumpSchema } from '@/lib/validations'

export async function GET() {
  try {
    const pumps = await prisma.pump.findMany({
      include: {
        fuelType: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ pumps })
  } catch (error) {
    console.error('Get pumps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pumps' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = createPumpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, fuelTypeId } = validation.data

    // Check if pump name already exists
    const existing = await prisma.pump.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Pump name already exists' },
        { status: 400 }
      )
    }

    // Create pump
    const pump = await prisma.pump.create({
      data: {
        name,
        fuelTypeId,
      },
      include: {
        fuelType: true,
      },
    })

    return NextResponse.json({ pump }, { status: 201 })
  } catch (error: any) {
    console.error('Create pump error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create pump' },
      { status: 500 }
    )
  }
}
