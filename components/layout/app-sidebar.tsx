'use client'

// Application sidebar with role-based navigation and mobile responsiveness
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Fuel, Gauge, Package, FileBarChart, ClipboardCheck, Clock, History, Calculator, UserCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface AppSidebarProps {
  role: 'ADMIN' | 'CASHIER'
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Employees', href: '/admin/employees', icon: UserCircle }, // Added employees link
    { title: 'Fuel Types', href: '/admin/fuel-types', icon: Fuel },
    { title: 'Pumps', href: '/admin/pumps', icon: Gauge },
    { title: 'Fuel Stock', href: '/admin/fuel-stock', icon: Package },
    { title: 'Handovers', href: '/admin/handovers', icon: ClipboardCheck },
    { title: 'Reports', href: '/admin/reports', icon: FileBarChart },
    { title: 'Salary', href: '/admin/salary', icon: Calculator },
  ]

  // Cashier navigation items
  const cashierNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/cashier/dashboard', icon: LayoutDashboard },
    { title: 'Start Shift', href: '/cashier/start-shift', icon: Clock },
    { title: 'Close Shift', href: '/cashier/close-shift', icon: ClipboardCheck },
    { title: 'Shifts History', href: '/cashier/shifts-history', icon: History },
  ]

  const navItems = role === 'ADMIN' ? adminNavItems : cashierNavItems

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)} // Close mobile menu on navigation
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <div className="fixed left-4 top-20 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="border-b border-border bg-card px-4 py-3">
              <h2 className="font-semibold">{role === 'ADMIN' ? 'Admin Menu' : 'Cashier Menu'}</h2>
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border bg-card md:block">
        <SidebarContent />
      </aside>
    </>
  )
}
