'use client'

// Dialog for updating fuel prices
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface FuelTypeWithPriceHistory {
  id: string
  name: string
  priceHistory: Array<{
    pricePerLiter: number
    effectiveTo: string | null
  }>
}

interface UpdatePriceDialogProps {
  fuelType: FuelTypeWithPriceHistory
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePriceDialog({ fuelType, open, onOpenChange }: UpdatePriceDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const currentPrice = fuelType.priceHistory.find((p) => !p.effectiveTo)
  const [price, setPrice] = useState(currentPrice ? Number(currentPrice.pricePerLiter).toFixed(2) : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/fuel-types/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelTypeId: fuelType.id,
          pricePerLiter: parseFloat(price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price')
      }

      toast({
        title: 'Success',
        description: 'Price updated successfully',
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Price - {fuelType.name}</DialogTitle>
          <DialogDescription>Set a new price per liter</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price per Liter ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={loading}
              placeholder="0.00"
            />
            {currentPrice && (
              <p className="text-sm text-muted-foreground">
                Current: ${Number(currentPrice.pricePerLiter).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Price'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
