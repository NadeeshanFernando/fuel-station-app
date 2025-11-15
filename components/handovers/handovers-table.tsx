'use client'

// Table showing handovers with approval actions
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Shift {
  id: string
  startTime: Date
  endTime: Date | null
  status: string
  attendantName: string
  openingReading: number
  closingReading: number
  litersSold: number
  pricePerLiter: number
  expectedAmount: number
  cashAmount: number
  cardAmount: number
  creditAmount: number | null
  difference: number
  remarks: string | null
  pump: {
    name: string
  }
  fuelType: {
    name: string
  }
  cashier: {
    name: string
    username: string
  }
}

interface HandoversTableProps {
  shifts: Shift[]
  showActions: boolean
}

export function HandoversTable({ shifts, showActions }: HandoversTableProps) {
  if (shifts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        {showActions ? 'No pending handovers' : 'No handover history'}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <HandoverRow key={shift.id} shift={shift} showActions={showActions} />
      ))}
    </div>
  )
}

function HandoverRow({ shift, showActions }: { shift: Shift; showActions: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true)

    try {
      const response = await fetch('/api/pump-shifts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: shift.id,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update shift')
      }

      toast({
        title: 'Success',
        description: `Shift ${status.toLowerCase()} successfully`,
      })

      setActionDialog(null)
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

  const statusColor = {
    PENDING_APPROVAL: 'bg-warning text-warning-foreground',
    APPROVED: 'default',
    REJECTED: 'destructive',
  }[shift.status] || 'secondary'

  const difference = Number(shift.difference || 0)
  const isDifferenceSignificant = Math.abs(difference) > 0.01

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg border border-border">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">{shift.pump.name}</p>
                  <Badge variant="outline">{shift.fuelType.name}</Badge>
                  <Badge variant={statusColor as any}>
                    {shift.status.replace('_', ' ')}
                  </Badge>
                  {isDifferenceSignificant && (
                    <Badge variant={difference >= 0 ? 'outline' : 'destructive'}>
                      {difference >= 0 ? 'Excess' : 'Short'}: ${Math.abs(difference).toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Cashier: {shift.cashier.name} • Attendant: {shift.attendantName}</p>
                  <p>
                    {format(new Date(shift.startTime), 'MMM dd, yyyy HH:mm')}
                    {shift.endTime && ` - ${format(new Date(shift.endTime), 'HH:mm')}`}
                  </p>
                  <p>
                    {shift.litersSold.toFixed(2)} L sold • 
                    Expected: ${shift.expectedAmount.toFixed(2)} • 
                    Collected: ${(shift.cashAmount + shift.cardAmount + (shift.creditAmount || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success border-success hover:bg-success hover:text-success-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionDialog('approve')
                    }}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionDialog('reject')
                    }}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>

            <CollapsibleTrigger className="w-full mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
                <span>{isOpen ? 'Hide' : 'Show'} details</span>
              </div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="border-t border-border p-4 bg-muted/50">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">Meter Readings</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opening:</span>
                      <span className="font-mono">{shift.openingReading.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing:</span>
                      <span className="font-mono">{shift.closingReading.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span className="text-muted-foreground">Liters Sold:</span>
                      <span className="font-mono">{shift.litersSold.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per Liter:</span>
                      <span className="font-mono">${shift.pricePerLiter.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Expected Amount:</span>
                      <span className="font-mono">${shift.expectedAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Collection Details</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash:</span>
                      <span className="font-mono">${shift.cashAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card:</span>
                      <span className="font-mono">${shift.cardAmount.toFixed(2)}</span>
                    </div>
                    {shift.creditAmount && shift.creditAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credit:</span>
                        <span className="font-mono">${shift.creditAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span className="text-muted-foreground">Total Collected:</span>
                      <span className="font-mono">
                        ${(shift.cashAmount + shift.cardAmount + (shift.creditAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span className={difference >= 0 ? 'text-success' : 'text-destructive'}>
                        {difference >= 0 ? 'Excess:' : 'Short:'}
                      </span>
                      <span className={`font-mono ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${Math.abs(difference).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {shift.remarks && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-1">Remarks:</p>
                  <p className="text-sm text-muted-foreground">{shift.remarks}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Approve Dialog */}
      <AlertDialog open={actionDialog === 'approve'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Shift Handover</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this shift? This action will finalize the handover and record the sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('APPROVED')}
              disabled={loading}
              className="bg-success hover:bg-success/90"
            >
              {loading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={actionDialog === 'reject'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Shift Handover</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this shift? The cashier will need to review and resubmit if necessary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('REJECTED')}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
