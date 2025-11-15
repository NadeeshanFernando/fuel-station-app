'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface FuelTank {
  id: string
  name: string
  color: string
  tankCapacity: number
  minStockAlert: number
  currentStock: number
  isActive: boolean
}

export function TankManagement() {
  const { toast } = useToast()
  const [tanks, setTanks] = useState<FuelTank[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTank, setEditingTank] = useState<FuelTank | null>(null)
  const [open, setOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    tankCapacity: '',
    minStockAlert: '',
    currentStock: '',
  })

  useEffect(() => {
    fetchTanks()
  }, [])

  const fetchTanks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fuel-types')
      if (!response.ok) throw new Error('Failed to fetch tanks')
      
      const data = await response.json()
      setTanks(data.fuelTypes)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch fuel tanks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tank: FuelTank) => {
    setEditingTank(tank)
    setFormData({
      tankCapacity: tank.tankCapacity.toString(),
      minStockAlert: tank.minStockAlert.toString(),
      currentStock: tank.currentStock.toString(),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!editingTank) return

    try {
      const response = await fetch(`/api/fuel-types/${editingTank.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tankCapacity: parseFloat(formData.tankCapacity),
          minStockAlert: parseFloat(formData.minStockAlert),
          currentStock: parseFloat(formData.currentStock),
        }),
      })

      if (!response.ok) throw new Error('Failed to update tank')

      toast({
        title: 'Success',
        description: 'Tank configuration updated successfully',
      })

      setOpen(false)
      fetchTanks()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tank configuration',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tank Configuration</h2>
        <p className="text-muted-foreground">
          Set tank capacity, alert levels, and manage current stock for each fuel type
        </p>
      </div>

      <div className="grid gap-4">
        {tanks.map((tank) => (
          <Card key={tank.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: tank.color }}
                  />
                  <div>
                    <CardTitle>{tank.name}</CardTitle>
                    <CardDescription>
                      {tank.isActive ? 'Active' : 'Inactive'}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => handleEdit(tank)} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tank Capacity</p>
                  <p className="text-xl font-bold">{tank.tankCapacity.toFixed(0)} L</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min Alert Level</p>
                  <p className="text-xl font-bold">{tank.minStockAlert.toFixed(0)} L</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="text-xl font-bold">{tank.currentStock.toFixed(0)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Tank: {editingTank?.name}</DialogTitle>
            <DialogDescription>
              Set tank capacity, minimum alert level, and current stock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tankCapacity">Tank Capacity (Liters)</Label>
              <Input
                id="tankCapacity"
                type="number"
                step="0.01"
                value={formData.tankCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, tankCapacity: e.target.value })
                }
                placeholder="e.g., 10000"
              />
              <p className="text-xs text-muted-foreground">
                Maximum capacity of the fuel tank
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockAlert">Minimum Alert Level (Liters)</Label>
              <Input
                id="minStockAlert"
                type="number"
                step="0.01"
                value={formData.minStockAlert}
                onChange={(e) =>
                  setFormData({ ...formData, minStockAlert: e.target.value })
                }
                placeholder="e.g., 1000"
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this level
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock (Liters)</Label>
              <Input
                id="currentStock"
                type="number"
                step="0.01"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({ ...formData, currentStock: e.target.value })
                }
                placeholder="e.g., 5000"
              />
              <p className="text-xs text-muted-foreground">
                Current fuel level in the tank
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
