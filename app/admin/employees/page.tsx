import { db } from '@/lib/db'
import { EmployeesTable } from '@/components/employees/employees-table'

export default async function EmployeesPage() {
  const employees = await db.employee.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Convert Decimal to number for serialization
  const serializedEmployees = employees.map((emp) => ({
    ...emp,
    basicSalary: Number(emp.basicSalary),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage all employees including pump attendants and staff</p>
      </div>

      <EmployeesTable employees={serializedEmployees} />
    </div>
  )
}
