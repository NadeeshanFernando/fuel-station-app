/**
 * Application Constants
 * 
 * Centralized location for all configuration values, magic numbers,
 * and constant values used throughout the application.
 */

// ============================================================================
// APPLICATION INFO
// ============================================================================

export const APP_NAME = 'Fuel Station Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Complete fuel station management with shifts, stock, and salary tracking';

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const API_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const TOKEN_KEY = 'auth_token';
export const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// SALARY CALCULATION
// ============================================================================

export const WORKING_DAYS_PER_MONTH = 26;
export const FULL_DAY_LEAVE_DEDUCTION_MULTIPLIER = 1;
export const HALF_DAY_LEAVE_DEDUCTION_MULTIPLIER = 0.5;

// ============================================================================
// FUEL STOCK LEVELS
// ============================================================================

export const STOCK_STATUS_THRESHOLDS = {
  CRITICAL: 0.10,  // 10% or below
  LOW: 0.25,       // 25% or below
  NORMAL: 0.75,    // 25% to 75%
  HIGH: 0.75,      // Above 75%
} as const;

// ============================================================================
// DATE & TIME FORMATS
// ============================================================================

export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  PHONE: {
    PATTERN: /^[0-9]{10,15}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  FUEL_CODE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
  },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const TOAST_DURATION = 3000; // 3 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const MOBILE_BREAKPOINT = 768; // pixels

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const USER_ROLES = ['ADMIN', 'CASHIER'] as const;
export const SHIFT_STATUSES = ['OPEN', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const;

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const FUEL_COLORS = {
  PETROL_92: '#EF4444',    // Red
  PETROL_95: '#F97316',    // Orange
  DIESEL: '#3B82F6',       // Blue
  SUPER_DIESEL: '#8B5CF6', // Purple
  DEFAULT: '#6B7280',      // Gray
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
} as const;
