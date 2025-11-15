'use client'

// Dashboard statistics cards with animated numbers
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, DollarSign, CreditCard, Banknote, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStatsProps {
  pendingHandovers: number
  todaySales: {
    liters: number
    cash: number
    card: number
    credit: number
    total: number
    difference: number
  }
}

export function DashboardStats({ pendingHandovers, todaySales }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Pending Handovers',
      value: pendingHandovers,
      icon: AlertCircle,
      color: pendingHandovers > 0 ? 'text-warning' : 'text-muted-foreground',
    },
    {
      title: 'Total Sales',
      value: `$${todaySales.total.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Cash Collection',
      value: `$${todaySales.cash.toFixed(2)}`,
      icon: Banknote,
      color: 'text-primary',
    },
    {
      title: 'Card Payments',
      value: `$${todaySales.card.toFixed(2)}`,
      icon: CreditCard,
      color: 'text-primary',
    },
    {
      title: 'Liters Sold',
      value: todaySales.liters.toFixed(2),
      icon: TrendingUp,
      color: 'text-foreground',
    },
    {
      title: 'Cash Difference',
      value: `$${Math.abs(todaySales.difference).toFixed(2)}`,
      icon: todaySales.difference >= 0 ? TrendingUp : TrendingDown,
      color: todaySales.difference >= 0 ? 'text-success' : 'text-destructive',
      subtitle: todaySales.difference >= 0 ? 'Excess' : 'Short',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className={`text-xs ${stat.color}`}>{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
