// Login page for both admin and cashier users
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Fuel Station</h1>
          <p className="mt-2 text-muted-foreground">Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
