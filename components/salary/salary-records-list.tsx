'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Edit, Trash2 } from 'lucide-react'
import { EditSalaryDialog } from './edit-salary-dialog'

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
    id: string
    name: string
    position: string // Updated from username to position
  }
}

export function SalaryRecordsList() {
  const { toast } = useToast()
  const [records, setRecords] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterMonth && filterMonth !== 'all') params.append('month', filterMonth)
      if (filterYear && filterYear !== 'all') params.append('year', filterYear)

      const response = await fetch(`/api/salary?${params}`)
      if (!response.ok) throw new Error('Failed to fetch records')
      
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load salary records',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filterMonth, filterYear])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return

    try {
      const response = await fetch(`/api/salary/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      toast({
        title: 'Success',
        description: 'Salary record deleted successfully',
      })
      fetchRecords()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete salary record',
        variant: 'destructive',
      })
    }
  }

  const monthName = (month: number) => new Date(2024, month - 1).toLocaleString('default', { month: 'long' })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Salary Records</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {monthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No salary records found</div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium min-w-[150px]">Employee</th>
                      <th className="pb-3 font-medium min-w-[120px]">Month/Year</th>
                      <th className="pb-3 font-medium text-right min-w-[120px]">Total Salary</th>
                      <th className="pb-3 font-medium text-right min-w-[120px]">Deductions</th>
                      <th className="pb-3 font-medium text-right min-w-[120px]">Net Salary</th>
                      <th className="pb-3 font-medium text-right min-w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{record.employee.name}</div>
                            <div className="text-xs text-muted-foreground">{record.employee.position}</div>
                          </div>
                        </td>
                        <td className="py-3">{monthName(record.month)} {record.year}</td>
                        <td className="py-3 text-right">Rs. {record.totalSalary.toFixed(2)}</td>
                        <td className="py-3 text-right text-destructive">- Rs. {record.totalDeductions.toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-primary">Rs. {record.netSalary.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setEditingRecord(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editingRecord && (
        <EditSalaryDialog
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null)
            fetchRecords()
          }}
        />
      )}
    </>
  )
}
