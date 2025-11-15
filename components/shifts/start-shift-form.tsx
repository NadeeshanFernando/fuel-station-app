'use client'

// Form for starting a new pump shift
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'

interface Pump {
  id: string
  name: string
  fuelType: {
    id: string
    name: string
    priceHistory: Array<{
      pricePerLiter: any
    }>
  }
}

interface StartShiftFormProps {
  pumps: Pump[]
}

export function StartShiftForm({ pumps }: StartShiftFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pumpId: '',
    attendantName: '',
    openingReading: '',
  })

  const selectedPump = pumps.find((p) => p.id === formData.pumpId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.post('/api/pump-shifts', {
        ...formData,
        openingReading: parseFloat(formData.openingReading),
      })

      toast({
        title: 'Success',
        description: 'Shift started successfully',
      })

      router.push('/cashier/dashboard')
      router.refresh()
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

  if (pumps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active pumps available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please contact admin to activate pumps
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pump">Select Pump</Label>
        <Select
          value={formData.pumpId}
          onValueChange={(value) => setFormData({ ...formData, pumpId: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a pump" />
          </SelectTrigger>
          <SelectContent>
            {pumps.map((pump) => (
              <SelectItem key={pump.id} value={pump.id}>
                {pump.name} - {pump.fuelType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPump && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{selectedPump.fuelType.name}</Badge>
            <span className="text-sm text-muted-foreground">
              Current price: ${Number(selectedPump.fuelType.priceHistory[0]?.pricePerLiter || 0).toFixed(2)}/L
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendant">Attendant Name</Label>
        <Input
          id="attendant"
          value={formData.attendantName}
          onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
          required
          disabled={loading}
          placeholder="Enter attendant name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening">Opening Meter Reading</Label>
        <Input
          id="opening"
          type="number"
          step="0.01"
          min="0"
          value={formData.openingReading}
          onChange={(e) => setFormData({ ...formData, openingReading: e.target.value })}
          required
          disabled={loading}
          placeholder="0.00"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/cashier/dashboard')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.pumpId}>
          {loading ? 'Starting...' : 'Start Shift'}
        </Button>
      </div>
    </form>
  )
}
