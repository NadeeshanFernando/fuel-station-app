'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Droplet } from 'lucide-react'
import { AnimatedFuelCylinder } from '@/components/fuel-stock/animated-fuel-cylinder'

interface FuelStock {
  id: string
  name: string
  color: string
  unit: string
  capacity: number
  current_stock: number
  min_stock_alert: number
  stock_percentage: number
  stock_status: string
}

interface Delivery {
  id: string
  fuel_type_name: string
  quantity_delivered: string
  delivery_date: string
  supplier_name: string
  invoice_number: string
  received_by: string
}

interface StockHistory {
  fuel_type_name: string
  stock_type: string
  quantity: string
  recorded_at: string
  recorded_by: string
}

export function FuelStockView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    currentStock: FuelStock[]
    deliveries: Delivery[]
    stockHistory: StockHistory[]
  } | null>(null)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/fuel-stock')
      if (!response.ok) throw new Error('Failed to fetch report')

      const result = await response.json()
      setData(result)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch fuel stock report',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading report...</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Animated Cylinders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.currentStock.map((stock) => (
          <AnimatedFuelCylinder
            key={stock.id}
            fuelName={stock.name}
            currentStock={parseFloat(stock.current_stock.toString())}
            capacity={parseFloat(stock.capacity.toString())}
            minAlert={parseFloat(stock.min_stock_alert.toString())}
            color={stock.color}
            unit={stock.unit}
          />
        ))}
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Fuel deliveries in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {data.deliveries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No deliveries recorded</p>
          ) : (
            <div className="space-y-4">
              {data.deliveries.slice(0, 10).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{delivery.fuel_type_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.supplier_name} • Invoice: {delivery.invoice_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(delivery.delivery_date).toLocaleDateString()} • Received by {delivery.received_by}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{parseFloat(delivery.quantity_delivered).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement History */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
          <CardDescription>Opening and closing stock records</CardDescription>
        </CardHeader>
        <CardContent>
          {data.stockHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No stock records found</p>
          ) : (
            <div className="space-y-3">
              {data.stockHistory.slice(0, 15).map((record, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        record.stock_type === 'OPENING' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}
                    >
                      <Droplet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{record.fuel_type_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.recorded_at).toLocaleString()} • {record.recorded_by}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${record.stock_type === 'OPENING' ? 'text-blue-600' : 'text-purple-600'}`}>
                      {parseFloat(record.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">{record.stock_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
