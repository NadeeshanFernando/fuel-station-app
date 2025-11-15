'use client'

// Dialog for interim handovers during an active shift
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
import { DollarSign } from 'lucide-react'

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

interface InterimHandoverDialogProps {
  shift: Shift
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InterimHandoverDialog({ shift, open, onOpenChange }: InterimHandoverDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cashAmount: '',
    cardAmount: '',
    remarks: '',
  })

  const cashAmount = parseFloat(formData.cashAmount) || 0
  const cardAmount = parseFloat(formData.cardAmount) || 0
  const totalAmount = cashAmount + cardAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('[v0] Interim handover - Shift ID:', shift.id)
      console.log('[v0] Interim handover - Amounts:', { cashAmount, cardAmount })
      
      const response = await fetch(`/api/pump-shifts/${shift.id}/interim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashAmount,
          cardAmount: cardAmount || 0,
          remarks: formData.remarks || undefined,
        }),
      })

      const data = await response.json()
      console.log('[v0] Interim handover - Response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record interim handover')
      }

      toast({
        title: 'Success',
        description: 'Interim handover recorded successfully',
      })

      onOpenChange(false)
      setFormData({ cashAmount: '', cardAmount: '', remarks: '' })
      router.refresh()
    } catch (error: any) {
      console.error('[v0] Interim handover error:', error)
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interim Handover - {shift.pump.name}</DialogTitle>
          <DialogDescription>
            Record mid-shift cash/card collection for security purposes
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
            <p className="text-xs text-muted-foreground">
              This is a mid-shift collection. The shift will remain open.
            </p>
          </div>

          {/* Collection Amounts */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interim-cash">Cash Amount ($) *</Label>
              <Input
                id="interim-cash"
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
              <Label htmlFor="interim-card">Card Amount ($)</Label>
              <Input
                id="interim-card"
                type="number"
                step="0.01"
                min="0"
                value={formData.cardAmount}
                onChange={(e) => setFormData({ ...formData, cardAmount: e.target.value })}
                disabled={loading}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="interim-remarks">Remarks</Label>
            <Textarea
              id="interim-remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              disabled={loading}
              placeholder="Any notes about this interim collection..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {totalAmount > 0 && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Total Collecting:</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totalAmount === 0}>
              {loading ? 'Recording...' : 'Record Handover'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
