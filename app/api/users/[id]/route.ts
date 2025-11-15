// PATCH /api/users/[id] - Update user (admin only)
// Can update name, isActive status, and reset password
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data: any = {}

    if (validation.data.name !== undefined) {
      data.name = validation.data.name
    }

    if (validation.data.isActive !== undefined) {
      data.isActive = validation.data.isActive
    }

    if (validation.data.password !== undefined) {
      data.passwordHash = await hashPassword(validation.data.password)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
