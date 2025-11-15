// Zod validation schemas for API requests
// Defines input validation rules for all forms and API endpoints

import { z } from 'zod'

// Auth validation
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// User validation
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'CASHIER']),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})

// Fuel type validation
export const createFuelTypeSchema = z.object({
  name: z.string().min(2, 'Fuel type name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#3b82f6'),
  tankCapacity: z.number().positive('Tank capacity must be positive').optional(), // Added tank capacity
  minStockAlert: z.number().nonnegative('Min alert must be non-negative').optional(), // Added min alert
})

export const updateFuelPriceSchema = z.object({
  fuelTypeId: z.string(),
  pricePerLiter: z.number().positive('Price must be positive'),
})

// Pump validation
export const createPumpSchema = z.object({
  name: z.string().min(2, 'Pump name is required'),
  fuelTypeId: z.string(),
})

export const updatePumpSchema = z.object({
  name: z.string().min(2).optional(),
  fuelTypeId: z.string().optional(),
  isActive: z.boolean().optional(),
})

// Pump shift validation
export const startShiftSchema = z.object({
  pumpId: z.string(),
  attendantName: z.string().min(2, 'Attendant name is required'),
  openingReading: z.number().nonnegative('Opening reading must be non-negative'),
})

export const closeShiftSchema = z.object({
  closingReading: z.number().nonnegative('Closing reading must be non-negative'),
  cashAmount: z.number().nonnegative('Cash amount must be non-negative'),
  cardAmount: z.number().nonnegative('Card amount must be non-negative'),
  creditAmount: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
})

export const approveShiftSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

// Fuel delivery validation
export const createDeliverySchema = z.object({
  fuelTypeId: z.string(),
  date: z.string().or(z.date()),
  quantityLiters: z.number().positive('Quantity must be positive'),
  invoiceNumber: z.string().optional(),
  remarks: z.string().optional(),
})

// Stock validation
export const setOpeningStockSchema = z.object({
  date: z.string().or(z.date()),
  fuelTypeId: z.string(),
  openingStockLiters: z.number().nonnegative('Opening stock must be non-negative'),
})

export const setClosingStockSchema = z.object({
  date: z.string().or(z.date()),
  fuelTypeId: z.string(),
  closingPhysicalStockLiters: z.number().nonnegative('Closing stock must be non-negative'),
})

export const updateTankConfigSchema = z.object({
  tankCapacity: z.number().positive('Tank capacity must be positive').optional(),
  minStockAlert: z.number().nonnegative('Min alert must be non-negative').optional(),
  currentStock: z.number().nonnegative('Current stock must be non-negative').optional(),
})

// Salary calculation validation schemas
export const createSalaryRecordSchema = z.object({
  employeeId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  basicSalary: z.number().positive('Basic salary must be positive'),
  totalSalary: z.number().positive('Total salary must be positive'),
  fullDayLeaves: z.number().int().nonnegative('Full day leaves cannot be negative').default(0),
  halfDayLeaves: z.number().int().nonnegative('Half day leaves cannot be negative').default(0),
  loanAmount: z.number().nonnegative('Loan amount cannot be negative').default(0),
  remarks: z.string().optional(),
})

export const updateSalaryRecordSchema = z.object({
  basicSalary: z.number().positive().optional(),
  totalSalary: z.number().positive().optional(),
  fullDayLeaves: z.number().int().nonnegative().optional(),
  halfDayLeaves: z.number().int().nonnegative().optional(),
  loanAmount: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
})

// Employee validation schemas
export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  position: z.string().min(2, 'Position is required'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  joinDate: z.string().or(z.date()).optional(),
  basicSalary: z.number().positive('Basic salary must be positive'),
})

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  position: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  basicSalary: z.number().positive().optional(),
  isActive: z.boolean().optional(),
})
