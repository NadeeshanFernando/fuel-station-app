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

  const serializedFuelTypes = fuelTypes.map((fuelType) => ({
    id: fuelType.id,
    name: fuelType.name,
    color: fuelType.color,
    isActive: fuelType.isActive,
    tankCapacity: Number(fuelType.tankCapacity),
    minStockAlert: Number(fuelType.minStockAlert),
    currentStock: Number(fuelType.currentStock),
    createdAt: fuelType.createdAt.toISOString(),
    updatedAt: fuelType.updatedAt.toISOString(),
    priceHistory: fuelType.priceHistory.map((price) => ({
      id: price.id,
      pricePerLiter: Number(price.pricePerLiter),
      effectiveFrom: price.effectiveFrom.toISOString(),
      effectiveTo: price.effectiveTo ? price.effectiveTo.toISOString() : null,
    })),
  }))

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
          <FuelTypesTable fuelTypes={serializedFuelTypes} />
        </CardContent>
      </Card>
    </div>
  )
}
