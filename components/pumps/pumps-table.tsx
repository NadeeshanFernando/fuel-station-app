'use client'

// Pumps table with edit and toggle active functionality
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditPumpDialog } from './edit-pump-dialog'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Pump {
  id: string
  name: string
  isActive: boolean
  fuelType: {
    id: string
    name: string
  }
}

interface FuelType {
  id: string
  name: string
}

interface PumpsTableProps {
  pumps: Pump[]
  fuelTypes: FuelType[]
}

export function PumpsTable({ pumps, fuelTypes }: PumpsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingPump, setEditingPump] = useState<Pump | null>(null)

  const handleToggleActive = async (pumpId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pumps/${pumpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update pump')

      toast({
        title: 'Success',
        description: `Pump ${!currentStatus ? 'activated' : 'deactivated'}`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update pump status',
        variant: 'destructive',
      })
    }
  }

  if (pumps.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No pumps found. Create your first pump.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {pumps.map((pump) => (
          <div
            key={pump.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{pump.name}</p>
                <Badge variant="outline">{pump.fuelType.name}</Badge>
                <Badge variant={pump.isActive ? 'outline' : 'destructive'}>
                  {pump.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Dispensing: {pump.fuelType.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingPump(pump)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={pump.isActive ? 'destructive' : 'default'}
                onClick={() => handleToggleActive(pump.id, pump.isActive)}
              >
                {pump.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingPump && (
        <EditPumpDialog
          pump={editingPump}
          fuelTypes={fuelTypes}
          open={!!editingPump}
          onOpenChange={(open) => !open && setEditingPump(null)}
        />
      )}
    </>
  )
}
