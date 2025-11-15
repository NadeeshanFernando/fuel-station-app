/**
 * Central Type Definitions for Fuel Station Management System
 * 
 * All TypeScript interfaces and types used across the application.
 * This provides a single source of truth for data structures.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  email: string | null;
  basicSalary: number;
  isActive: boolean;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeInput {
  name: string;
  position: string;
  phone?: string;
  email?: string;
  basicSalary: number;
  joinedDate: Date;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  isActive?: boolean;
}

// ============================================================================
// FUEL TYPE TYPES
// ============================================================================

export interface FuelType {
  id: string;
  name: string;
  code: string;
  currentPrice: number;
  color: string;
  tankCapacity: number;
  minAlertLevel: number;
  currentStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFuelTypeInput {
  name: string;
  code: string;
  initialPrice: number;
  color: string;
  tankCapacity: number;
  minAlertLevel: number;
  currentStock: number;
}

export interface UpdateFuelTypeInput {
  tankCapacity: number;
  minAlertLevel: number;
}

export interface UpdatePriceInput {
  fuelTypeId: string;
  newPrice: number;
  effectiveFrom: Date;
}

// ============================================================================
// PUMP TYPES
// ============================================================================

export interface Pump {
  id: string;
  name: string;
  fuelTypeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fuelType?: FuelType;
}

export interface CreatePumpInput {
  name: string;
  fuelTypeId: string;
}

// ============================================================================
// PUMP SHIFT TYPES
// ============================================================================

export type ShiftStatus = 'OPEN' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface PumpShift {
  id: string;
  pumpId: string;
  fuelTypeId: string;
  cashierId: string;
  attendantName: string;
  openingReading: number;
  closingReading: number | null;
  litersSold: number;
  pricePerLiter: number;
  expectedAmount: number;
  cashAmount: number;
  cardAmount: number;
  creditAmount: number;
  difference: number;
  status: ShiftStatus;
  startTime: Date;
  endTime: Date | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  pump?: Pump;
  fuelType?: FuelType;
  cashier?: User;
  interimHandovers?: InterimHandover[];
}

export interface StartShiftInput {
  pumpId: string;
  attendantName: string;
  openingReading: number;
}

export interface CloseShiftInput {
  closingReading: number;
  cashAmount: number;
  cardAmount: number;
  creditAmount: number;
  remarks?: string;
}

export interface InterimHandover {
  id: string;
  shiftId: string;
  amount: number;
  remarks: string | null;
  createdAt: Date;
}

export interface CreateInterimHandoverInput {
  amount: number;
  remarks?: string;
}

export interface ApproveShiftInput {
  shiftId: string;
  approved: boolean;
  adminRemarks?: string;
}

// ============================================================================
// FUEL STOCK TYPES
// ============================================================================

export interface FuelOpeningStock {
  id: string;
  fuelTypeId: string;
  date: Date;
  openingStock: number;
  remarks: string | null;
  createdAt: Date;
  fuelType?: FuelType;
}

export interface FuelDelivery {
  id: string;
  fuelTypeId: string;
  deliveryDate: Date;
  quantity: number;
  invoiceNumber: string;
  supplierName: string;
  remarks: string | null;
  createdAt: Date;
  fuelType?: FuelType;
}

export interface FuelClosingStock {
  id: string;
  fuelTypeId: string;
  date: Date;
  closingStock: number;
  remarks: string | null;
  createdAt: Date;
  fuelType?: FuelType;
}

export interface StockCylinder {
  fuelType: FuelType;
  currentStock: number;
  tankCapacity: number;
  percentage: number;
  status: 'critical' | 'low' | 'normal' | 'high';
}

// ============================================================================
// SALARY TYPES
// ============================================================================

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  fullDayLeaves: number;
  halfDayLeaves: number;
  loans: number;
  deductions: number;
  netSalary: number;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee?: Employee;
}

export interface CalculateSalaryInput {
  employeeId: string;
  month: number;
  year: number;
  fullDayLeaves: number;
  halfDayLeaves: number;
  loans: number;
  remarks?: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface SalesReport {
  totalSales: number;
  totalLiters: number;
  salesByFuelType: {
    fuelType: string;
    amount: number;
    liters: number;
  }[];
  salesByCashier: {
    cashier: string;
    amount: number;
    shifts: number;
  }[];
}

export interface FuelStockReport {
  currentStock: StockCylinder[];
  recentDeliveries: FuelDelivery[];
  stockMovement: {
    date: string;
    opening: number;
    deliveries: number;
    sold: number;
    closing: number;
  }[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
