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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pumps</h1>
          <p className="text-muted-foreground">Manage fuel pumps and assignments</p>
        </div>
        <CreatePumpDialog fuelTypes={fuelTypes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pumps</CardTitle>
          <CardDescription>Configure and manage fuel pumps</CardDescription>
        </CardHeader>
        <CardContent>
          <PumpsTable pumps={pumps} fuelTypes={fuelTypes} />
        </CardContent>
      </Card>
    </div>
  )
}
