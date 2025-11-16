// Admin page for managing pumps
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePumpDialog } from '@/components/pumps/create-pump-dialog'
import { PumpsTable } from '@/components/pumps/pumps-table'

export default async function PumpsPage() {
  const [pumps, fuelTypes] = await Promise.all([
    prisma.pump.findMany({
      include: {
        fuelType: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.fuelType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const serializedFuelTypes = fuelTypes.map((fuelType) => ({
    id: fuelType.id,
    name: fuelType.name,
    color: fuelType.color,
    tankCapacity: Number(fuelType.tankCapacity),
    minStockAlert: Number(fuelType.minStockAlert),
    currentStock: Number(fuelType.currentStock),
    isActive: fuelType.isActive,
    createdAt: fuelType.createdAt.toISOString(),
    updatedAt: fuelType.updatedAt.toISOString(),
  }))

  const serializedPumps = pumps.map((pump) => ({
    id: pump.id,
    name: pump.name,
    isActive: pump.isActive,
    createdAt: pump.createdAt.toISOString(),
    updatedAt: pump.updatedAt.toISOString(),
    fuelType: {
      id: pump.fuelType.id,
      name: pump.fuelType.name,
      color: pump.fuelType.color,
      tankCapacity: Number(pump.fuelType.tankCapacity),
      minStockAlert: Number(pump.fuelType.minStockAlert),
      currentStock: Number(pump.fuelType.currentStock),
      isActive: pump.fuelType.isActive,
      createdAt: pump.fuelType.createdAt.toISOString(),
      updatedAt: pump.fuelType.updatedAt.toISOString(),
    },
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pumps</h1>
          <p className="text-muted-foreground">Manage fuel pumps and assignments</p>
        </div>
        <CreatePumpDialog fuelTypes={serializedFuelTypes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pumps</CardTitle>
          <CardDescription>Configure and manage fuel pumps</CardDescription>
        </CardHeader>
        <CardContent>
          <PumpsTable pumps={serializedPumps} fuelTypes={serializedFuelTypes} />
        </CardContent>
      </Card>
    </div>
  )
}
