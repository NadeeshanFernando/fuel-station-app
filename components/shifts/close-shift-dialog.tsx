'use client'

// Dialog for closing a shift with handover details
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Shift {
  id: string
  openingReading: number
  pricePerLiter: number
  attendantName: string
  pump: {
    name: string
  }
  fuelType: {
    name: string
  }
}

interface CloseShiftDialogProps {
  shift: Shift
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CloseShiftDialog({ shift, open, onOpenChange }: CloseShiftDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    closingReading: '',
    cashAmount: '',
    cardAmount: '',
    creditAmount: '',
    remarks: '',
  })

  // Calculate summary
  const closingReading = parseFloat(formData.closingReading) || 0
  const cashAmount = parseFloat(formData.cashAmount) || 0
  const cardAmount = parseFloat(formData.cardAmount) || 0
  const creditAmount = parseFloat(formData.creditAmount) || 0
  const openingReading = shift.openingReading
  const pricePerLiter = shift.pricePerLiter

  const litersSold = closingReading - openingReading
  const expectedAmount = litersSold * pricePerLiter
  const totalCollected = cashAmount + cardAmount + creditAmount
  const difference = expectedAmount - totalCollected

  const isValid = closingReading >= openingReading && litersSold > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/pump-shifts/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingReading,
          cashAmount,
          cardAmount,
          creditAmount: creditAmount || 0,
          remarks: formData.remarks || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close shift')
      }

      toast({
        title: 'Success',
        description: 'Shift closed and submitted for approval',
      })

      onOpenChange(false)
      router.push('/cashier/dashboard')
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Close Shift - {shift.pump.name}</DialogTitle>
          <DialogDescription>
            Record closing meter reading and cash/card collection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shift Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{shift.fuelType.name}</Badge>
              <span className="text-sm text-muted-foreground">
                Attendant: {shift.attendantName}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Opening Reading: </span>
              <span className="font-medium">{shift.openingReading.toFixed(2)} L</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Price: </span>
              <span className="font-medium">${shift.pricePerLiter.toFixed(2)} / liter</span>
            </div>
          </div>

          {/* Meter Reading */}
          <div className="space-y-2">
            <Label htmlFor="closing">Closing Meter Reading *</Label>
            <Input
              id="closing"
              type="number"
              step="0.01"
              min={shift.openingReading}
              value={formData.closingReading}
              onChange={(e) => setFormData({ ...formData, closingReading: e.target.value })}
              required
              disabled={loading}
              placeholder="0.00"
            />
          </div>

          {/* Collection Amounts */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount ($) *</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min="0"
                value={formData.cashAmount}
                onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                required
                disabled={loading}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card">Card Amount ($) *</Label>
              <Input
                id="card"
                type="number"
                step="0.01"
                min="0"
                value={formData.cardAmount}
                onChange={(e) => setFormData({ ...formData, cardAmount: e.target.value })}
                required
                disabled={loading}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit">Credit Amount ($)</Label>
              <Input
                id="credit"
                type="number"
                step="0.01"
                min="0"
                value={formData.creditAmount}
                onChange={(e) => setFormData({ ...formData, creditAmount: e.target.value })}
                disabled={loading}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              disabled={loading}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {isValid && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-semibold">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Liters Sold:</span>
                  </div>
                  <div className="text-right font-medium">
                    {litersSold.toFixed(2)} L
                  </div>

                  <div>
                    <span className="text-muted-foreground">Expected Amount:</span>
                  </div>
                  <div className="text-right font-medium">
                    ${expectedAmount.toFixed(2)}
                  </div>

                  <div>
                    <span className="text-muted-foreground">Total Collected:</span>
                  </div>
                  <div className="text-right font-medium">
                    ${totalCollected.toFixed(2)}
                  </div>

                  <Separator className="col-span-2" />

                  <div>
                    <span className={difference >= 0 ? 'text-success' : 'text-destructive'}>
                      {difference >= 0 ? 'Excess:' : 'Short:'}
                    </span>
                  </div>
                  <div className={`text-right font-bold ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${Math.abs(difference).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? 'Closing...' : 'Close Shift'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
