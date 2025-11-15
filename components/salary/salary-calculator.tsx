'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Calculator, Calendar } from 'lucide-react'

interface SalaryCalculatorProps {
  employees: { id: string; name: string; position: string }[] // Updated to use employees instead of cashiers
}

export function SalaryCalculator({ employees }: SalaryCalculatorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    totalSalary: '',
    fullDayLeaves: '0',
    halfDayLeaves: '0',
    loanAmount: '0',
    remarks: '',
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

    if (!formData.employeeId || !formData.basicSalary || !formData.totalSalary) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          month: formData.month,
          year: formData.year,
          basicSalary: parseFloat(formData.basicSalary),
          totalSalary: parseFloat(formData.totalSalary),
          fullDayLeaves: parseInt(formData.fullDayLeaves),
          halfDayLeaves: parseInt(formData.halfDayLeaves),
          loanAmount: parseFloat(formData.loanAmount),
          remarks: formData.remarks,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Success',
        description: 'Salary record saved successfully',
      })

      // Reset form
      setFormData({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        totalSalary: '',
        fullDayLeaves: '0',
        halfDayLeaves: '0',
        loanAmount: '0',
        remarks: '',
      })
      setCalculatedResult(null)
      window.location.reload()
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculate Monthly Salary
        </CardTitle>
        <CardDescription>Enter salary details and deductions to calculate net salary</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <Label htmlFor="month" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Month & Year *
              </Label>
              <div className="flex gap-2">
                <Select value={formData.month.toString()} onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-24"
                  min="2020"
                />
              </div>
            </div>

            {/* Basic Salary */}
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary *</Label>
              <Input
                id="basicSalary"
                type="number"
                step="0.01"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {/* Total Salary */}
            <div className="space-y-2">
              <Label htmlFor="totalSalary">Total Salary (with allowances) *</Label>
              <Input
                id="totalSalary"
                type="number"
                step="0.01"
                value={formData.totalSalary}
                onChange={(e) => setFormData({ ...formData, totalSalary: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {/* Full Day Leaves */}
            <div className="space-y-2">
              <Label htmlFor="fullDayLeaves">Full Day Leaves</Label>
              <Input
                id="fullDayLeaves"
                type="number"
                value={formData.fullDayLeaves}
                onChange={(e) => setFormData({ ...formData, fullDayLeaves: e.target.value })}
                min="0"
              />
            </div>

            {/* Half Day Leaves */}
            <div className="space-y-2">
              <Label htmlFor="halfDayLeaves">Half Day Leaves</Label>
              <Input
                id="halfDayLeaves"
                type="number"
                value={formData.halfDayLeaves}
                onChange={(e) => setFormData({ ...formData, halfDayLeaves: e.target.value })}
                min="0"
              />
            </div>

            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Deduction</Label>
              <Input
                id="loanAmount"
                type="number"
                step="0.01"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Calculate Button */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={calculateSalary} className="flex-1">
              Calculate
            </Button>
            <Button type="submit" disabled={loading || !calculatedResult} className="flex-1">
              {loading ? 'Saving...' : 'Save Record'}
            </Button>
          </div>

          {/* Calculation Result */}
          {calculatedResult && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h3 className="font-semibold text-lg">Calculation Summary</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Salary:</span>
                  <span className="font-medium">Rs. {parseFloat(formData.totalSalary).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Total Deductions:</span>
                  <span className="font-medium">- Rs. {calculatedResult.totalDeductions.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Salary:</span>
                  <span className="text-primary">Rs. {calculatedResult.netSalary.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
