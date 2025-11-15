'use client'

// Users table with actions to edit and deactivate users
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { EditUserDialog } from './edit-user-dialog'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
  username: string
  role: string
  isActive: boolean
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast({
        title: 'Success',
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      })
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No users found. Create your first cashier account.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.name}</p>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
                <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Username: {user.username}</p>
              <p className="text-xs text-muted-foreground">
                Created: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={user.isActive ? 'destructive' : 'default'}
                onClick={() => handleToggleActive(user.id, user.isActive)}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}
    </>
  )
}
