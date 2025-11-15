// GET /api/fuel-deliveries - List fuel deliveries
// POST /api/fuel-deliveries - Create new delivery (admin)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { createDeliverySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const fuelTypeId = searchParams.get('fuelTypeId')

    const where: any = {}
    if (date) {
      const deliveryDate = new Date(date)
      deliveryDate.setHours(0, 0, 0, 0)
      where.date = deliveryDate
    }
    if (fuelTypeId) {
      where.fuelTypeId = fuelTypeId
    }

    const deliveries = await prisma.fuelDelivery.findMany({
      where,
      include: {
        fuelType: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('Get deliveries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validate input
    const validation = createDeliverySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { fuelTypeId, date, quantityLiters, invoiceNumber, remarks } = validation.data
    const deliveryDate = new Date(date)
    deliveryDate.setHours(0, 0, 0, 0)

    const delivery = await prisma.fuelDelivery.create({
      data: {
        fuelTypeId,
        date: deliveryDate,
        quantityLiters,
        invoiceNumber,
        remarks,
      },
      include: {
        fuelType: true,
      },
    })

    return NextResponse.json({ delivery }, { status: 201 })
  } catch (error: any) {
    console.error('Create delivery error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create delivery' },
      { status: 500 }
    )
  }
}
