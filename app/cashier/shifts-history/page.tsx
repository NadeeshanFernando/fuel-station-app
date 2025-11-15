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
  const shifts = await prisma.pumpShift.findMany({
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
