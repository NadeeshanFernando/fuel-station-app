import { prisma } from '@/lib/db'
import { SalaryCalculator } from '@/components/salary/salary-calculator'
import { SalaryRecordsList } from '@/components/salary/salary-records-list'

export default async function SalaryPage() {
  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      position: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salary Calculator</h1>
        <p className="text-muted-foreground">Calculate and manage employee monthly salaries</p>
      </div>

      <SalaryCalculator employees={employees} />
      <SalaryRecordsList />
    </div>
  )
}
