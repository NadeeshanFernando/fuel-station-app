'use client'

import { useEffect, useState } from 'react'
import { AnimatedFuelCylinder } from '@/components/fuel-stock/animated-fuel-cylinder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FuelTank {
  id: string
  name: string
  color: string
  tankCapacity: number
  minStockAlert: number
  currentStock: number
}

export function StockCylindersView() {
  const { toast } = useToast()
  const [tanks, setTanks] = useState<FuelTank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTanks()
  }, [])

  const fetchTanks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fuel-stock/view')
      if (!response.ok) throw new Error('Failed to fetch tanks')
      
      const data = await response.json()
      setTanks(data.tanks)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch fuel stock data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading fuel stock...</p>
      </div>
    )
  }

  if (tanks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tanks Configured</CardTitle>
          <CardDescription>
            Go to Tank Management tab to set up your fuel tanks
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Current Stock Levels</h2>
          <p className="text-muted-foreground">Real-time fuel inventory visualization</p>
        </div>
        <Button onClick={fetchTanks} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tanks.map((tank) => (
          <AnimatedFuelCylinder
            key={tank.id}
            fuelName={tank.name}
            currentStock={tank.currentStock}
            capacity={tank.tankCapacity}
            minAlert={tank.minStockAlert}
            color={tank.color}
            unit="L"
          />
        ))}
      </div>
    </div>
  )
}
