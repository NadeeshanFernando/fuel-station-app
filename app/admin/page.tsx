// Admin dashboard with key metrics and overview
import { prisma } from '@/lib/db'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentShifts } from '@/components/dashboard/recent-shifts'

export default async function AdminDashboardPage() {
  // Fetch today's data for dashboard
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get pending handovers count
  const pendingHandovers = await prisma.pumpShift.count({
    where: { status: 'PENDING_APPROVAL' },
  })

  // Get today's approved shifts
  const approvedShifts = await prisma.pumpShift.findMany({
    where: {
      status: 'APPROVED',
      startTime: { gte: today },
    },
    include: {
      pump: true,
      fuelType: true,
      cashier: true,
    },
  })

  // Calculate today's totals
  const todaySales = approvedShifts.reduce(
    (acc, shift) => {
      const litersSold = Number(shift.litersSold || 0)
      const cashAmount = Number(shift.cashAmount || 0)
      const cardAmount = Number(shift.cardAmount || 0)
      const creditAmount = Number(shift.creditAmount || 0)
      const difference = Number(shift.difference || 0)

      return {
        liters: acc.liters + litersSold,
        cash: acc.cash + cashAmount,
        card: acc.card + cardAmount,
        credit: acc.credit + creditAmount,
        total: acc.total + cashAmount + cardAmount + creditAmount,
        difference: acc.difference + difference,
      }
    },
    { liters: 0, cash: 0, card: 0, credit: 0, total: 0, difference: 0 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today's operations</p>
      </div>

      <DashboardStats
        pendingHandovers={pendingHandovers}
        todaySales={todaySales}
      />

      <RecentShifts shifts={approvedShifts.slice(0, 5)} />
    </div>
  )
}
