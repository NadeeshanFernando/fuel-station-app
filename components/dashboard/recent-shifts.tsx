'use client'

// Recent shifts table component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Shift {
  id: string
  startTime: Date
  pump: { name: string }
  fuelType: { name: string }
  cashier: { name: string }
  attendantName: string
  litersSold: any
  expectedAmount: any
  status: string
}

interface RecentShiftsProps {
  shifts: Shift[]
}

export function RecentShifts({ shifts }: RecentShiftsProps) {
  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
          <CardDescription>No approved shifts today</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Shifts</CardTitle>
        <CardDescription>Latest approved shifts from today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{shift.pump.name}</p>
                  <Badge variant="outline">{shift.fuelType.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Attendant: {shift.attendantName} | Cashier: {shift.cashier.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(shift.startTime), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {shift.litersSold ? Number(shift.litersSold).toFixed(2) : '0.00'} L
                </p>
                <p className="text-sm text-muted-foreground">
                  ${shift.expectedAmount ? Number(shift.expectedAmount).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
