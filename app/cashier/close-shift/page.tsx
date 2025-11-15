// Cashier page to close active shifts
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CloseShiftList } from '@/components/shifts/close-shift-list'

export default async function CloseShiftPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get open shifts for this cashier
  const openShifts = await prisma.pumpShift.findMany({
    where: {
      cashierId: session.userId,
      status: 'OPEN',
    },
    include: {
      pump: true,
      fuelType: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  const serializedShifts = openShifts.map((shift) => ({
    ...shift,
    openingReading: Number(shift.openingReading),
    closingReading: shift.closingReading ? Number(shift.closingReading) : null,
    litersSold: shift.litersSold ? Number(shift.litersSold) : null,
    pricePerLiter: Number(shift.pricePerLiter),
    expectedAmount: shift.expectedAmount ? Number(shift.expectedAmount) : null,
    cashAmount: shift.cashAmount ? Number(shift.cashAmount) : null,
    cardAmount: shift.cardAmount ? Number(shift.cardAmount) : null,
    creditAmount: shift.creditAmount ? Number(shift.creditAmount) : null,
    difference: shift.difference ? Number(shift.difference) : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Close Shift</h1>
        <p className="text-muted-foreground">Record handover and close active shifts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Shifts</CardTitle>
          <CardDescription>
            {openShifts.length > 0
              ? 'Select a shift to close and record handover details'
              : 'No active shifts to close'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CloseShiftList shifts={serializedShifts} />
        </CardContent>
      </Card>
    </div>
  )
}
