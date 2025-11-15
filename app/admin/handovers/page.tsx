// Admin page for reviewing and approving shift handovers
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HandoversTable } from '@/components/handovers/handovers-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function HandoversPage() {
  // Get pending handovers
  const pendingHandoversRaw = await prisma.pumpShift.findMany({
    where: {
      status: 'PENDING_APPROVAL',
    },
    include: {
      pump: true,
      fuelType: true,
      cashier: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: {
      endTime: 'desc',
    },
  })

  // Get recent approved/rejected handovers
  const recentHandoversRaw = await prisma.pumpShift.findMany({
    where: {
      status: {
        in: ['APPROVED', 'REJECTED'],
      },
    },
    include: {
      pump: true,
      fuelType: true,
      cashier: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20,
  })

  const pendingHandovers = pendingHandoversRaw.map(shift => ({
    ...shift,
    openingReading: Number(shift.openingReading),
    closingReading: Number(shift.closingReading),
    litersSold: Number(shift.litersSold),
    pricePerLiter: Number(shift.pricePerLiter),
    expectedAmount: Number(shift.expectedAmount),
    cashAmount: Number(shift.cashAmount),
    cardAmount: Number(shift.cardAmount),
    creditAmount: shift.creditAmount ? Number(shift.creditAmount) : null,
    difference: Number(shift.difference),
  }))

  const recentHandovers = recentHandoversRaw.map(shift => ({
    ...shift,
    openingReading: Number(shift.openingReading),
    closingReading: Number(shift.closingReading),
    litersSold: Number(shift.litersSold),
    pricePerLiter: Number(shift.pricePerLiter),
    expectedAmount: Number(shift.expectedAmount),
    cashAmount: Number(shift.cashAmount),
    cardAmount: Number(shift.cardAmount),
    creditAmount: shift.creditAmount ? Number(shift.creditAmount) : null,
    difference: Number(shift.difference),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Handovers</h1>
        <p className="text-muted-foreground">Review and approve shift handovers</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingHandovers.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Handovers</CardTitle>
              <CardDescription>Shifts awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <HandoversTable shifts={pendingHandovers} showActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Handovers</CardTitle>
              <CardDescription>Recently approved or rejected shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <HandoversTable shifts={recentHandovers} showActions={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
