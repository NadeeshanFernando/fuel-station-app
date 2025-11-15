// Cashier dashboard with active shifts and quick actions
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

export default async function CashierDashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get active shifts for this cashier
  const activeShifts = await prisma.pumpShift.findMany({
    where: {
      cashierId: session.userId,
      status: 'OPEN',
    },
    include: {
      pump: true,
      fuelType: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  // Get recent shifts
  const recentShifts = await prisma.pumpShift.findMany({
    where: {
      cashierId: session.userId,
      status: { not: 'OPEN' },
    },
    include: {
      pump: true,
      fuelType: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your shifts and handovers</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/cashier/start-shift">
          <Card className="cursor-pointer transition-colors hover:bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Start New Shift
              </CardTitle>
              <CardDescription>Begin a new pump shift with an attendant</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/cashier/close-shift">
          <Card className="cursor-pointer transition-colors hover:bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-success" />
                Close Shift
              </CardTitle>
              <CardDescription>Record handover and close an active shift</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Active Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shifts</CardTitle>
          <CardDescription>
            {activeShifts.length > 0
              ? `You have ${activeShifts.length} active shift(s)`
              : 'No active shifts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeShifts.length > 0 ? (
            <div className="space-y-3">
              {activeShifts.map((shift) => (
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
                    <p className="text-xs text-muted-foreground">
                      Started {formatDistanceToNow(new Date(shift.startTime), { addSuffix: true })}
                    </p>
                  </div>
                  <Link href="/cashier/close-shift">
                    <Button size="sm">Close Shift</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No active shifts. Start a new shift to begin.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      {recentShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Shifts</CardTitle>
            <CardDescription>Your latest shift history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{shift.pump.name}</p>
                      <Badge variant="outline">{shift.fuelType.name}</Badge>
                      <Badge
                        variant={
                          shift.status === 'APPROVED'
                            ? 'default'
                            : shift.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {shift.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Attendant: {shift.attendantName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(shift.startTime), { addSuffix: true })}
                    </p>
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
