/**
 * Business Logic Calculations
 * 
 * All calculation logic for salary, fuel stock, shifts, etc.
 * These pure functions are easily testable and reusable.
 */

import { WORKING_DAYS_PER_MONTH, FULL_DAY_LEAVE_DEDUCTION_MULTIPLIER, HALF_DAY_LEAVE_DEDUCTION_MULTIPLIER, STOCK_STATUS_THRESHOLDS } from '@/src/config/constants';

// ============================================================================
// SALARY CALCULATIONS
// ============================================================================

/**
 * Calculate daily salary rate based on basic monthly salary
 */
export function calculateDailySalary(basicSalary: number): number {
  return basicSalary / WORKING_DAYS_PER_MONTH;
}

/**
 * Calculate total leave deductions
 */
export function calculateLeaveDeductions(
  basicSalary: number,
  fullDayLeaves: number,
  halfDayLeaves: number
): number {
  const dailySalary = calculateDailySalary(basicSalary);
  
  const fullDayDeduction = fullDayLeaves * dailySalary * FULL_DAY_LEAVE_DEDUCTION_MULTIPLIER;
  const halfDayDeduction = halfDayLeaves * dailySalary * HALF_DAY_LEAVE_DEDUCTION_MULTIPLIER;
  
  return fullDayDeduction + halfDayDeduction;
}

/**
 * Calculate total deductions (leaves + loans)
 */
export function calculateTotalDeductions(
  basicSalary: number,
  fullDayLeaves: number,
  halfDayLeaves: number,
  loans: number
): number {
  const leaveDeductions = calculateLeaveDeductions(basicSalary, fullDayLeaves, halfDayLeaves);
  return leaveDeductions + loans;
}

/**
 * Calculate net salary after all deductions
 */
export function calculateNetSalary(
  basicSalary: number,
  fullDayLeaves: number,
  halfDayLeaves: number,
  loans: number
): number {
  const totalDeductions = calculateTotalDeductions(basicSalary, fullDayLeaves, halfDayLeaves, loans);
  return Math.max(0, basicSalary - totalDeductions);
}

// ============================================================================
// SHIFT CALCULATIONS
// ============================================================================

/**
 * Calculate liters sold based on meter readings
 */
export function calculateLitersSold(openingReading: number, closingReading: number): number {
  return Math.max(0, closingReading - openingReading);
}

/**
 * Calculate expected cash amount based on liters and price
 */
export function calculateExpectedAmount(litersSold: number, pricePerLiter: number): number {
  return litersSold * pricePerLiter;
}

/**
 * Calculate total collected amount (cash + card + credit)
 */
export function calculateTotalCollected(cash: number, card: number, credit: number): number {
  return cash + card + credit;
}

/**
 * Calculate cash difference (shortage or excess)
 */
export function calculateCashDifference(
  expectedAmount: number,
  cashAmount: number,
  cardAmount: number,
  creditAmount: number
): number {
  const totalCollected = calculateTotalCollected(cashAmount, cardAmount, creditAmount);
  return totalCollected - expectedAmount;
}

// ============================================================================
// STOCK CALCULATIONS
// ============================================================================

/**
 * Calculate stock percentage
 */
export function calculateStockPercentage(currentStock: number, tankCapacity: number): number {
  if (tankCapacity === 0) return 0;
  return (currentStock / tankCapacity) * 100;
}

/**
 * Determine stock status based on percentage
 */
export function getStockStatus(percentage: number): 'critical' | 'low' | 'normal' | 'high' {
  if (percentage <= STOCK_STATUS_THRESHOLDS.CRITICAL * 100) return 'critical';
  if (percentage <= STOCK_STATUS_THRESHOLDS.LOW * 100) return 'low';
  if (percentage <= STOCK_STATUS_THRESHOLDS.NORMAL * 100) return 'normal';
  return 'high';
}

/**
 * Calculate remaining capacity
 */
export function calculateRemainingCapacity(currentStock: number, tankCapacity: number): number {
  return Math.max(0, tankCapacity - currentStock);
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

/**
 * Format currency with proper decimals
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format liters with proper decimals
 */
export function formatLiters(liters: number): string {
  return liters.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}
