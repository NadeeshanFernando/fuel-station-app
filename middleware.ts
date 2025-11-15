// Middleware for authentication and route protection
// Redirects unauthenticated users to login and enforces role-based access

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session token from cookie
  const token = request.cookies.get('session')?.value

  // Verify session
  const session = token ? await verifySession(token) : null

  // Public routes that don't require authentication
  const isPublicRoute = pathname === '/login' || pathname === '/'

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (session && pathname === '/login') {
    const dashboardUrl = session.role === 'ADMIN' ? '/admin/dashboard' : '/cashier/dashboard'
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // Check role-based access
  if (session) {
    // Admin trying to access cashier routes
    if (session.role === 'ADMIN' && pathname.startsWith('/cashier')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Cashier trying to access admin routes
    if (session.role === 'CASHIER' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/cashier/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|placeholder.svg).*)',
  ],
}
