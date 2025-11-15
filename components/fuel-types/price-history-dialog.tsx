'use client'

// Dialog showing price history for a fuel type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface FuelType {
  name: string
  priceHistory: Array<{
    id: string
    pricePerLiter: any
    effectiveFrom: Date
    effectiveTo: Date | null
  }>
}

interface PriceHistoryDialogProps {
  fuelType: FuelType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PriceHistoryDialog({ fuelType, open, onOpenChange }: PriceHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Price History - {fuelType.name}</DialogTitle>
          <DialogDescription>Historical price changes</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {fuelType.priceHistory.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No price history available
            </p>
          ) : (
            fuelType.priceHistory.map((price) => (
              <div
                key={price.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">
                    ${Number(price.pricePerLiter).toFixed(2)} / liter
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: {format(new Date(price.effectiveFrom), 'MMM dd, yyyy HH:mm')}
                  </p>
                  {price.effectiveTo && (
                    <p className="text-sm text-muted-foreground">
                      To: {format(new Date(price.effectiveTo), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
                {!price.effectiveTo && (
                  <div className="rounded-full bg-success px-3 py-1 text-xs font-medium text-success-foreground">
                    Current
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
