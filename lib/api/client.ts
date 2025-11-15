/**
 * Centralized API Client
 * 
 * This client provides a consistent interface for making API calls.
 * Benefits:
 * - Automatic token handling
 * - Consistent error handling
 * - Type-safe requests
 * - Easy to swap backends (Next.js -> Python)
 * 
 * Usage:
 * import { apiClient } from '@/lib/api/client'
 * const data = await apiClient.get('/api/users')
 * const newUser = await apiClient.post('/api/users', { name: 'John' })
 */

import { API_BASE_URL } from './endpoints'

/**
 * Get auth token from cookies
 */
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find((c) => c.trim().startsWith('session='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

/**
 * Standard error response from API
 */
export interface ApiError {
  error: string
  details?: unknown
}

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseURL?: string
  headers?: Record<string, string>
}

/**
 * Create API client instance
 */
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL
    this.defaultHeaders = config.headers || {}
  }

  /**
   * Build headers for request
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...customHeaders,
    }

    // Add auth token if available
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }))
      throw new Error(error.error || 'API request failed')
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      ...options,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      ...options,
    })
    return this.handleResponse<T>(response)
  }

  /**
   * Update base URL (useful when switching from Next.js to Python backend)
   */
  setBaseURL(url: string) {
    this.baseURL = url
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }
