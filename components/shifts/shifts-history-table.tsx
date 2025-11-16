'use client'

// Table showing shift history with details
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface Shift {
  id: string
  startTime: string | Date
  endTime: string | Date | null
  status: string
  attendantName: string
  openingReading: any
  closingReading: any
  litersSold: any
  pricePerLiter: any
  expectedAmount: any
  cashAmount: any
  cardAmount: any
  creditAmount: any
  difference: any
  remarks: string | null
  pump: {
    name: string
  }
  fuelType: {
    name: string
  }
}

interface ShiftsHistoryTableProps {
  shifts: Shift[]
}

export function ShiftsHistoryTable({ shifts }: ShiftsHistoryTableProps) {
  if (shifts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No shift history available
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <ShiftRow key={shift.id} shift={shift} />
      ))}
    </div>
  )
}

function ShiftRow({ shift }: { shift: Shift }) {
  const [isOpen, setIsOpen] = useState(false)

  const statusColor = {
    OPEN: 'bg-success',
    PENDING_APPROVAL: 'bg-warning text-warning-foreground',
    APPROVED: 'default',
    REJECTED: 'destructive',
  }[shift.status] || 'secondary'

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border">
        <CollapsibleTrigger className="w-full p-4 hover:bg-muted transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{shift.pump.name}</p>
                  <Badge variant="outline">{shift.fuelType.name}</Badge>
                  <Badge variant={statusColor as any}>
                    {shift.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(shift.startTime), 'MMM dd, yyyy HH:mm')}
                  {shift.endTime && ` - ${format(new Date(shift.endTime), 'HH:mm')}`}
                </p>
              </div>
            </div>
            {shift.litersSold && (
              <div className="text-right">
                <p className="font-semibold">{Number(shift.litersSold).toFixed(2)} L</p>
                <p className="text-sm text-muted-foreground">
                  ${Number(shift.expectedAmount || 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border p-4 bg-muted/50">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-2">Shift Details</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attendant:</span>
                    <span>{shift.attendantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening:</span>
                    <span>{Number(shift.openingReading).toFixed(2)} L</span>
                  </div>
                  {shift.closingReading && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing:</span>
                      <span>{Number(shift.closingReading).toFixed(2)} L</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>${Number(shift.pricePerLiter).toFixed(2)}/L</span>
                  </div>
                </div>
              </div>

              {shift.status !== 'OPEN' && (
                <div>
                  <p className="text-sm font-medium mb-2">Financial Details</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash:</span>
                      <span>${Number(shift.cashAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card:</span>
                      <span>${Number(shift.cardAmount || 0).toFixed(2)}</span>
                    </div>
                    {shift.creditAmount && Number(shift.creditAmount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credit:</span>
                        <span>${Number(shift.creditAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span className={Number(shift.difference) >= 0 ? 'text-success' : 'text-destructive'}>
                        {Number(shift.difference) >= 0 ? 'Excess:' : 'Short:'}
                      </span>
                      <span className={Number(shift.difference) >= 0 ? 'text-success' : 'text-destructive'}>
                        ${Math.abs(Number(shift.difference || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {shift.remarks && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium mb-1">Remarks:</p>
                <p className="text-sm text-muted-foreground">{shift.remarks}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
