'use client'

// Dialog for creating new pumps
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FuelType {
  id: string
  name: string
}

interface CreatePumpDialogProps {
  fuelTypes: FuelType[]
}

export function CreatePumpDialog({ fuelTypes }: CreatePumpDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    fuelTypeId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/pumps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create pump')
      }

      toast({
        title: 'Success',
        description: 'Pump created successfully',
      })

      setOpen(false)
      setFormData({ name: '', fuelTypeId: '' })
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Pump
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Pump</DialogTitle>
          <DialogDescription>Add a new fuel pump to the station</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pump-name">Pump Name</Label>
            <Input
              id="pump-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              placeholder="e.g., Pump 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-type">Fuel Type</Label>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.fuelTypeId}>
              {loading ? 'Creating...' : 'Create Pump'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
