'use client'

// Fuel types table with price management
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UpdatePriceDialog } from './update-price-dialog'
import { PriceHistoryDialog } from './price-history-dialog'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface FuelType {
  id: string
  name: string
  color?: string // Added optional color field
  isActive: boolean
  priceHistory: Array<{
    id: string
    pricePerLiter: any
    effectiveFrom: Date
    effectiveTo: Date | null
  }>
}

interface FuelTypesTableProps {
  fuelTypes: FuelType[]
}

export function FuelTypesTable({ fuelTypes }: FuelTypesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [updatingPrice, setUpdatingPrice] = useState<FuelType | null>(null)
  const [viewingHistory, setViewingHistory] = useState<FuelType | null>(null)

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/fuel-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update fuel type')

      toast({
        title: 'Success',
        description: `Fuel type ${!currentStatus ? 'activated' : 'deactivated'}`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update fuel type',
        variant: 'destructive',
      })
    }
  }

  if (fuelTypes.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No fuel types found. Create your first fuel type.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {fuelTypes.map((fuelType) => {
          const currentPrice = fuelType.priceHistory.find((p) => !p.effectiveTo)
          return (
            <div
              key={fuelType.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-4">
                {fuelType.color && (
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-border"
                    style={{ backgroundColor: fuelType.color }}
                    title={`Color: ${fuelType.color}`}
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{fuelType.name}</p>
                    <Badge variant={fuelType.isActive ? 'outline' : 'destructive'}>
                      {fuelType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Price: ${currentPrice ? Number(currentPrice.pricePerLiter).toFixed(2) : 'Not set'} / liter
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingHistory(fuelType)}
                >
                  Price History
                </Button>
                <Button
                  size="sm"
                  onClick={() => setUpdatingPrice(fuelType)}
                >
                  Update Price
                </Button>
                <Button
                  size="sm"
                  variant={fuelType.isActive ? 'destructive' : 'default'}
                  onClick={() => handleToggleActive(fuelType.id, fuelType.isActive)}
                >
                  {fuelType.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {updatingPrice && (
        <UpdatePriceDialog
          fuelType={updatingPrice}
          open={!!updatingPrice}
          onOpenChange={(open) => !open && setUpdatingPrice(null)}
        />
      )}

      {viewingHistory && (
        <PriceHistoryDialog
          fuelType={viewingHistory}
          open={!!viewingHistory}
          onOpenChange={(open) => !open && setViewingHistory(null)}
        />
      )}
    </>
  )
}
