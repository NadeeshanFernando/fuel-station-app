// Admin page for managing fuel types and prices
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateFuelTypeDialog } from '@/components/fuel-types/create-fuel-type-dialog'
import { FuelTypesTable } from '@/components/fuel-types/fuel-types-table'

export default async function FuelTypesPage() {
  const fuelTypes = await prisma.fuelType.findMany({
    include: {
      priceHistory: {
        orderBy: { effectiveFrom: 'desc' },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Types</h1>
          <p className="text-muted-foreground">Manage fuel types and pricing</p>
        </div>
        <CreateFuelTypeDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fuel Types</CardTitle>
          <CardDescription>Manage fuel types and update prices</CardDescription>
        </CardHeader>
        <CardContent>
          <FuelTypesTable fuelTypes={fuelTypes} />
        </CardContent>
      </Card>
    </div>
  )
}
