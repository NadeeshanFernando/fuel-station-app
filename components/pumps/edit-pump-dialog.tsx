'use client'

// Dialog for editing pump details
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Pump {
  id: string
  name: string
  fuelType: {
    id: string
    name: string
  }
}

interface FuelType {
  id: string
  name: string
}

interface EditPumpDialogProps {
  pump: Pump
  fuelTypes: FuelType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPumpDialog({ pump, fuelTypes, open, onOpenChange }: EditPumpDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: pump.name,
    fuelTypeId: pump.fuelType.id,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/pumps/${pump.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update pump')
      }

      toast({
        title: 'Success',
        description: 'Pump updated successfully',
      })

      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pump</DialogTitle>
          <DialogDescription>Update pump details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-pump-name">Pump Name</Label>
            <Input
              id="edit-pump-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-fuel-type">Fuel Type</Label>
            <Select
              value={formData.fuelTypeId}
              onValueChange={(value) => setFormData({ ...formData, fuelTypeId: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Pump'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
