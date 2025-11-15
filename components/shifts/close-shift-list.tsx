'use client'

// List of active shifts with close dialog
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CloseShiftDialog } from './close-shift-dialog'
import { InterimHandoverDialog } from './interim-handover-dialog'
import { formatDistanceToNow } from 'date-fns'

interface Shift {
  id: string
  startTime: Date
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

interface CloseShiftListProps {
  shifts: Shift[]
}

export function CloseShiftList({ shifts }: CloseShiftListProps) {
  const [closingShift, setClosingShift] = useState<Shift | null>(null)
  const [interimShift, setInterimShift] = useState<Shift | null>(null)

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active shifts to close</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start a new shift to begin
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{shift.pump.name}</p>
                <Badge variant="outline">{shift.fuelType.name}</Badge>
                <Badge className="bg-success">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Attendant: {shift.attendantName}
              </p>
              <p className="text-sm text-muted-foreground">
                Opening: {shift.openingReading.toFixed(2)} L • 
                Price: ${shift.pricePerLiter.toFixed(2)}/L
              </p>
              <p className="text-xs text-muted-foreground">
                Started {formatDistanceToNow(new Date(shift.startTime), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setInterimShift(shift)}>
                Interim Handover
              </Button>
              <Button onClick={() => setClosingShift(shift)}>
                Close Shift
              </Button>
            </div>
          </div>
        ))}
      </div>

      {closingShift && (
        <CloseShiftDialog
          shift={closingShift}
          open={!!closingShift}
          onOpenChange={(open) => !open && setClosingShift(null)}
        />
      )}

      {interimShift && (
        <InterimHandoverDialog
          shift={interimShift}
          open={!!interimShift}
          onOpenChange={(open) => !open && setInterimShift(null)}
        />
      )}
    </>
  )
}
