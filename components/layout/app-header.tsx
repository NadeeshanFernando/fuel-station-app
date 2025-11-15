'use client'

// Application header with user info and logout button
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface AppHeaderProps {
  username: string
  role: 'ADMIN' | 'CASHIER'
}

export function AppHeader({ username, role }: AppHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Fuel Station</h1>
          <span className="text-sm text-muted-foreground">Management System</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-muted-foreground">
              {role === 'ADMIN' ? 'Administrator' : 'Cashier'}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
