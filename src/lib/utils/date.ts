/**
 * Date Utility Functions
 * 
 * Helper functions for date formatting and manipulation.
 */

import { format, parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { DATE_FORMAT, DISPLAY_DATE_FORMAT, DISPLAY_DATETIME_FORMAT } from '@/src/config/constants';

/**
 * Format date to API format (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return format(date, DATE_FORMAT);
}

/**
 * Format date for display (e.g., "Jan 15, 2025")
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DISPLAY_DATE_FORMAT);
}

/**
 * Format datetime for display (e.g., "Jan 15, 2025 14:30")
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DISPLAY_DATETIME_FORMAT);
}

/**
 * Get start of day (00:00:00)
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get end of day (23:59:59)
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Get first day of month
 */
export function getFirstDayOfMonth(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Get last day of month
 */
export function getLastDayOfMonth(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Get current month number (1-12)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get month name from number
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, 'MMMM');
}
