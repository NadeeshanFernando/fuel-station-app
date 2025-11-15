'use client'

// Closing stock tab for recording end-of-day physical stock
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface FuelType {
  id: string
  name: string
}

export function ClosingStockTab() {
  const { toast } = useToast()
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    fuelTypeId: '',
    closingPhysicalStockLiters: '',
  })

  useEffect(() => {
    fetchFuelTypes()
  }, [])

  const fetchFuelTypes = async () => {
    try {
      const response = await fetch('/api/fuel-types')
      const data = await response.json()
      setFuelTypes(data.fuelTypes.filter((ft: any) => ft.isActive))
    } catch (error) {
      console.error('Failed to fetch fuel types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/fuel-stock/closing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          closingPhysicalStockLiters: parseFloat(formData.closingPhysicalStockLiters),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set closing stock')
      }

      toast({
        title: 'Success',
        description: 'Closing stock recorded successfully',
      })

      setFormData({
        ...formData,
        fuelTypeId: '',
        closingPhysicalStockLiters: '',
      })
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Closing Stock</CardTitle>
        <CardDescription>Record end-of-day physical stock measurements</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="closing-date">Date</Label>
              <Input
                id="closing-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing-fuel-type">Fuel Type</Label>
              <Select
                value={formData.fuelTypeId}
                onValueChange={(value) => setFormData({ ...formData, fuelTypeId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuelType) => (
                    <SelectItem key={fuelType.id} value={fuelType.id}>
                      {fuelType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing-stock">Closing Physical Stock (Liters)</Label>
              <Input
                id="closing-stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.closingPhysicalStockLiters}
                onChange={(e) => setFormData({ ...formData, closingPhysicalStockLiters: e.target.value })}
                required
                disabled={loading}
                placeholder="0.00"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !formData.fuelTypeId}>
            {loading ? 'Recording...' : 'Record Closing Stock'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
