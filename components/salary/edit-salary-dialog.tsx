'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface SalaryRecord {
  id: string
  month: number
  year: number
  basicSalary: number
  totalSalary: number
  fullDayLeaves: number
  halfDayLeaves: number
  loanAmount: number
  totalDeductions: number
  netSalary: number
  remarks: string | null
  employee: {
    name: string
  }
}

interface EditSalaryDialogProps {
  record: SalaryRecord
  onClose: () => void
  onSuccess: () => void
}

export function EditSalaryDialog({ record, onClose, onSuccess }: EditSalaryDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    basicSalary: record.basicSalary.toString(),
    totalSalary: record.totalSalary.toString(),
    fullDayLeaves: record.fullDayLeaves.toString(),
    halfDayLeaves: record.halfDayLeaves.toString(),
    loanAmount: record.loanAmount.toString(),
    remarks: record.remarks || '',
  })
  const [calculatedResult, setCalculatedResult] = useState<{
    totalDeductions: number
    netSalary: number
  } | null>(null)

  const calculateSalary = () => {
    const workingDaysPerMonth = 26
    const totalSalary = parseFloat(formData.totalSalary) || 0
    const perDayDeduction = totalSalary / workingDaysPerMonth
    const fullDayDeduction = parseInt(formData.fullDayLeaves) * perDayDeduction
    const halfDayDeduction = parseInt(formData.halfDayLeaves) * (perDayDeduction / 2)
    const loanAmount = parseFloat(formData.loanAmount) || 0
    const totalDeductions = fullDayDeduction + halfDayDeduction + loanAmount
    const netSalary = totalSalary - totalDeductions

    setCalculatedResult({ totalDeductions, netSalary })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/salary/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicSalary: parseFloat(formData.basicSalary),
          totalSalary: parseFloat(formData.totalSalary),
          fullDayLeaves: parseInt(formData.fullDayLeaves),
          halfDayLeaves: parseInt(formData.halfDayLeaves),
          loanAmount: parseFloat(formData.loanAmount),
          remarks: formData.remarks,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: 'Success',
        description: 'Salary record updated successfully',
      })
      onSuccess()
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Salary Record - {record.employee.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary</Label>
              <Input
                id="basicSalary"
                type="number"
                step="0.01"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSalary">Total Salary</Label>
              <Input
                id="totalSalary"
                type="number"
                step="0.01"
                value={formData.totalSalary}
                onChange={(e) => setFormData({ ...formData, totalSalary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDayLeaves">Full Day Leaves</Label>
              <Input
                id="fullDayLeaves"
                type="number"
                value={formData.fullDayLeaves}
                onChange={(e) => setFormData({ ...formData, fullDayLeaves: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="halfDayLeaves">Half Day Leaves</Label>
              <Input
                id="halfDayLeaves"
                type="number"
                value={formData.halfDayLeaves}
                onChange={(e) => setFormData({ ...formData, halfDayLeaves: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="loanAmount">Loan Deduction</Label>
              <Input
                id="loanAmount"
                type="number"
                step="0.01"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={calculateSalary} className="flex-1">
              Recalculate
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {calculatedResult && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <h3 className="font-semibold">Updated Calculation</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Salary:</span>
                  <span>Rs. {parseFloat(formData.totalSalary).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Total Deductions:</span>
                  <span>- Rs. {calculatedResult.totalDeductions.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-bold">
                  <span>Net Salary:</span>
                  <span className="text-primary">Rs. {calculatedResult.netSalary.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
