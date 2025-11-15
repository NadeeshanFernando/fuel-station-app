'use client'

// Deliveries tab with form to record fuel deliveries
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Delivery {
  id: string
  date: Date
  quantityLiters: any
  invoiceNumber: string | null
  remarks: string | null
  fuelType: {
    name: string
  }
}

export function DeliveriesTab() {
  const { toast } = useToast()
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    fuelTypeId: '',
    quantityLiters: '',
    invoiceNumber: '',
    remarks: '',
  })

  useEffect(() => {
    fetchFuelTypes()
    fetchDeliveries()
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

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/fuel-deliveries')
      const data = await response.json()
      setDeliveries(data.deliveries.slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/fuel-deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantityLiters: parseFloat(formData.quantityLiters),
          invoiceNumber: formData.invoiceNumber || undefined,
          remarks: formData.remarks || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record delivery')
      }

      toast({
        title: 'Success',
        description: 'Fuel delivery recorded successfully',
      })

      setFormData({
        ...formData,
        fuelTypeId: '',
        quantityLiters: '',
        invoiceNumber: '',
        remarks: '',
      })
      fetchDeliveries()
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Fuel Delivery</CardTitle>
          <CardDescription>Log fuel deliveries from suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-date">Date</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-fuel-type">Fuel Type</Label>
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
                <Label htmlFor="quantity">Quantity (Liters)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantityLiters}
                  onChange={(e) => setFormData({ ...formData, quantityLiters: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice Number (Optional)</Label>
                <Input
                  id="invoice"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  disabled={loading}
                  placeholder="INV-12345"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  disabled={loading}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || !formData.fuelTypeId}>
              {loading ? 'Recording...' : 'Record Delivery'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Latest fuel deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No deliveries recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{delivery.fuelType.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(delivery.date), 'MMM dd, yyyy')}
                      {delivery.invoiceNumber && ` • Invoice: ${delivery.invoiceNumber}`}
                    </p>
                    {delivery.remarks && (
                      <p className="text-sm text-muted-foreground">{delivery.remarks}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(delivery.quantityLiters).toFixed(2)} L</p>
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
