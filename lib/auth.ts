// Authentication utilities for session management
// Provides functions to hash passwords, create sessions, and verify user authentication

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fuel-station-secret-key-change-in-production'
)

export interface SessionPayload {
  userId: string
  username: string
  role: 'ADMIN' | 'CASHIER'
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compare a plain text password with a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Create a JWT session token
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as SessionPayload
  } catch {
    return null
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  return verifySession(token)
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  
  if (session.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  return session
}

/**
 * Verify authentication from Request object (for API routes)
 */
export async function verifyAuth(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie')
  
  if (!cookieHeader) return null

  // Parse the session cookie from the header
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const token = cookies['session']

  if (!token) return null

  return verifySession(token)
}
