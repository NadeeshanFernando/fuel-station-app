// Debug endpoint to verify database state
// GET /api/debug/db-status - Check if users and data exist

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
      },
    })

    const fuelTypes = await prisma.fuelType.count()
    const pumps = await prisma.pump.count()
    const shifts = await prisma.pumpShift.count()

    return NextResponse.json({
      status: 'connected',
      counts: {
        users: users.length,
        fuelTypes,
        pumps,
        shifts,
      },
      users,
      message: users.length === 0 
        ? 'Database is empty. Run: npm run db:seed' 
        : 'Database has data',
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message,
        message: 'Failed to connect to database',
      },
      { status: 500 }
    )
  }
}
