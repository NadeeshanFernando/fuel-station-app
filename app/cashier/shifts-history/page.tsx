// Cashier page to view shift history
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShiftsHistoryTable } from '@/components/shifts/shifts-history-table'

export default async function ShiftsHistoryPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get all shifts for this cashier
  const shiftsRaw = await prisma.pumpShift.findMany({
    where: {
      cashierId: session.userId,
    },
    include: {
      pump: true,
      fuelType: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 50,
  })

  const shifts = shiftsRaw.map((shift) => ({
    id: shift.id,
    startTime: shift.startTime.toISOString(),
    endTime: shift.endTime ? shift.endTime.toISOString() : null,
    status: shift.status,
    attendantName: shift.attendantName,
    openingReading: Number(shift.openingReading ?? 0),
    closingReading: shift.closingReading != null ? Number(shift.closingReading) : null,
    litersSold: shift.litersSold != null ? Number(shift.litersSold) : null,
    pricePerLiter: Number(shift.pricePerLiter),
    expectedAmount: shift.expectedAmount != null ? Number(shift.expectedAmount) : null,
    cashAmount: shift.cashAmount != null ? Number(shift.cashAmount) : null,
    cardAmount: shift.cardAmount != null ? Number(shift.cardAmount) : null,
    creditAmount: shift.creditAmount != null ? Number(shift.creditAmount) : null,
    difference: shift.difference != null ? Number(shift.difference) : null,
    remarks: shift.remarks,
    pump: {
      name: shift.pump.name,
    },
    fuelType: {
      name: shift.fuelType.name,
    },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shifts History</h1>
        <p className="text-muted-foreground">View your previous shifts and their status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shifts</CardTitle>
          <CardDescription>Your complete shift history</CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftsHistoryTable shifts={shifts} />
        </CardContent>
      </Card>
    </div>
  )
}
