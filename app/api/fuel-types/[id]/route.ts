// PATCH /api/fuel-types/[id] - Update fuel type (toggle active status or tank configuration)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { updateTankConfigSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }

    if (body.tankCapacity !== undefined || body.minStockAlert !== undefined || body.currentStock !== undefined) {
      const validation = updateTankConfigSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        )
      }

      if (body.tankCapacity !== undefined) updateData.tankCapacity = body.tankCapacity
      if (body.minStockAlert !== undefined) updateData.minStockAlert = body.minStockAlert
      if (body.currentStock !== undefined) updateData.currentStock = body.currentStock
    }

    const fuelType = await prisma.fuelType.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ fuelType })
  } catch (error: any) {
    console.error('Update fuel type error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update fuel type' },
      { status: 500 }
    )
  }
}
