// API endpoint for recording interim handovers during active shifts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const interimHandoverSchema = z.object({
  cashAmount: z.number().min(0),
  cardAmount: z.number().min(0).optional(),
  remarks: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    console.log('[v0] Interim handover API - Shift ID:', params.id)
    
    const session = await verifyAuth(request)
    if (!session) {
      console.log('[v0] Interim handover - Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Interim handover - Session:', { userId: session.userId, role: session.role })

    const body = await request.json()
    console.log('[v0] Interim handover - Request body:', body)
    
    const { cashAmount, cardAmount, remarks } = interimHandoverSchema.parse(body)

    // Verify shift exists and belongs to this cashier
    const shift = await db.pumpShift.findUnique({
      where: { id: params.id },
    })

    console.log('[v0] Interim handover - Shift found:', shift ? 'Yes' : 'No')
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    console.log('[v0] Interim handover - Shift details:', { 
      cashierId: shift.cashierId, 
      sessionUserId: session.userId,
      status: shift.status 
    })

    if (shift.cashierId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (shift.status !== 'OPEN') {
      return NextResponse.json({ error: 'Shift is not open' }, { status: 400 })
    }

    // Create interim handover record
    console.log('[v0] Creating interim handover record...')
    const interimHandover = await db.interimHandover.create({
      data: {
        pumpShiftId: params.id,
        cashAmount,
        cardAmount: cardAmount || 0,
        remarks,
      },
    })

    console.log('[v0] Interim handover created successfully:', interimHandover.id)
    return NextResponse.json(interimHandover)
  } catch (error: any) {
    console.error('[v0] Interim handover error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
