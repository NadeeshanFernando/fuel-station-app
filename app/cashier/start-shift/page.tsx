// Cashier page to start a new pump shift
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartShiftForm } from '@/components/shifts/start-shift-form'

export default async function StartShiftPage() {
  // Get active pumps with current prices
  const pumpsRaw = await prisma.pump.findMany({
    where: { isActive: true },
    include: {
      fuelType: {
        include: {
          priceHistory: {
            where: { effectiveTo: null },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  const pumps = pumpsRaw.map((pump) => ({
    id: pump.id,
    name: pump.name,
    fuelType: {
      id: pump.fuelType.id,
      name: pump.fuelType.name,
      priceHistory: pump.fuelType.priceHistory.map((price) => ({
        pricePerLiter: Number(price.pricePerLiter),
      })),
    },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Start New Shift</h1>
        <p className="text-muted-foreground">Begin a new pump shift with attendant details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
          <CardDescription>Record pump assignment and opening meter reading</CardDescription>
        </CardHeader>
        <CardContent>
          <StartShiftForm pumps={pumps} />
        </CardContent>
      </Card>
    </div>
  )
}
