// Cashier layout with header and sidebar - responsive for all devices
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Redirect if not authenticated or not cashier
  if (!session || session.role !== 'CASHIER') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader username={session.username} role={session.role} />
      <AppSidebar role={session.role} />
      <main className="mt-16 p-4 md:ml-64 md:p-6">
        {children}
      </main>
    </div>
  )
}
