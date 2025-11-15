// PATCH /api/pumps/[id] - Update pump (admin only)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { updatePumpSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = updatePumpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const pump = await prisma.pump.update({
      where: { id },
      data: validation.data,
      include: {
        fuelType: true,
      },
    })

    return NextResponse.json({ pump })
  } catch (error: any) {
    console.error('Update pump error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update pump' },
      { status: 500 }
    )
  }
}
