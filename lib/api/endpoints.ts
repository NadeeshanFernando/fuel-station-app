/**
 * Centralized API Endpoints Registry
 * 
 * This file contains all API endpoints used in the application.
 * When migrating to Python backend, update the BASE_URL to point to your Python API.
 * 
 * Usage:
 * import { API_ENDPOINTS } from '@/lib/api/endpoints'
 * fetch(API_ENDPOINTS.auth.login, { method: 'POST', ... })
 */

// Base URL for all API calls
// For local Next.js API: ''
// For Python backend: 'http://localhost:8000' or your Python API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * All API endpoints organized by domain
 */
export const API_ENDPOINTS = {
  // Authentication APIs
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,        // POST - User login
    logout: `${API_BASE_URL}/api/auth/logout`,      // POST - User logout
  },

  // User Management APIs (System users with login credentials)
  users: {
    list: `${API_BASE_URL}/api/users`,              // GET - List all users
    create: `${API_BASE_URL}/api/users`,            // POST - Create new user
    update: (id: string) => `${API_BASE_URL}/api/users/${id}`, // PUT - Update user
    delete: (id: string) => `${API_BASE_URL}/api/users/${id}`, // DELETE - Delete user
  },

  // Employee Management APIs (All employees including non-system users)
  employees: {
    list: `${API_BASE_URL}/api/employees`,          // GET - List all employees
    create: `${API_BASE_URL}/api/employees`,        // POST - Create new employee
    update: (id: string) => `${API_BASE_URL}/api/employees/${id}`, // PUT - Update employee
    delete: (id: string) => `${API_BASE_URL}/api/employees/${id}`, // DELETE - Delete employee
  },

  // Fuel Type Management APIs
  fuelTypes: {
    list: `${API_BASE_URL}/api/fuel-types`,         // GET - List all fuel types
    create: `${API_BASE_URL}/api/fuel-types`,       // POST - Create fuel type
    update: (id: string) => `${API_BASE_URL}/api/fuel-types/${id}`, // PUT - Update fuel type (including tank config)
    delete: (id: string) => `${API_BASE_URL}/api/fuel-types/${id}`, // DELETE - Delete fuel type
    updatePrice: `${API_BASE_URL}/api/fuel-types/price`, // POST - Update fuel price (creates history)
  },

  // Pump Management APIs
  pumps: {
    list: `${API_BASE_URL}/api/pumps`,              // GET - List all pumps
    create: `${API_BASE_URL}/api/pumps`,            // POST - Create new pump
    update: (id: string) => `${API_BASE_URL}/api/pumps/${id}`, // PUT - Update pump
    delete: (id: string) => `${API_BASE_URL}/api/pumps/${id}`, // DELETE - Delete pump
  },

  // Fuel Stock Management APIs
  fuelStock: {
    view: `${API_BASE_URL}/api/fuel-stock/view`,   // GET - View current stock levels (for cylinders)
    recordOpening: `${API_BASE_URL}/api/fuel-stock/opening`, // POST - Record opening stock
    recordClosing: `${API_BASE_URL}/api/fuel-stock/closing`, // POST - Record closing stock
  },

  // Fuel Deliveries APIs
  fuelDeliveries: {
    list: `${API_BASE_URL}/api/fuel-deliveries`,   // GET - List all deliveries
    create: `${API_BASE_URL}/api/fuel-deliveries`, // POST - Record new delivery
  },

  // Pump Shifts Management APIs
  pumpShifts: {
    list: `${API_BASE_URL}/api/pump-shifts`,       // GET - List shifts (with status filter)
    create: `${API_BASE_URL}/api/pump-shifts`,     // POST - Start new shift
    update: (id: string) => `${API_BASE_URL}/api/pump-shifts/${id}`, // PUT - Close shift
    get: (id: string) => `${API_BASE_URL}/api/pump-shifts/${id}`, // GET - Get shift details
    approve: `${API_BASE_URL}/api/pump-shifts/approve`, // POST - Approve/reject handover
    interimHandover: (id: string) => `${API_BASE_URL}/api/pump-shifts/${id}/interim`, // POST - Mid-shift cash collection
  },

  // Reports APIs
  reports: {
    sales: `${API_BASE_URL}/api/reports/sales`,    // GET - Sales report (with date filters)
    fuelStock: `${API_BASE_URL}/api/reports/fuel-stock`, // GET - Fuel stock report
  },

  // Salary Management APIs
  salary: {
    list: `${API_BASE_URL}/api/salary`,            // GET - List salary records (with filters)
    create: `${API_BASE_URL}/api/salary`,          // POST - Create salary record
    update: (id: string) => `${API_BASE_URL}/api/salary/${id}`, // PUT - Update salary record
    delete: (id: string) => `${API_BASE_URL}/api/salary/${id}`, // DELETE - Delete salary record
  },

  // Debug/Utility APIs
  debug: {
    dbStatus: `${API_BASE_URL}/api/debug/db-status`, // GET - Check database status
  },
} as const

/**
 * API endpoint metadata for documentation and migration
 */
export const API_METADATA = {
  '/api/auth/login': {
    method: 'POST',
    auth: false,
    body: { username: 'string', password: 'string' },
    response: { token: 'string', user: 'User' },
  },
  '/api/auth/logout': {
    method: 'POST',
    auth: true,
    body: null,
    response: { success: 'boolean' },
  },
  '/api/users': {
    methods: ['GET', 'POST'],
    auth: true,
    roles: ['ADMIN'],
    get: { query: null, response: 'User[]' },
    post: { body: 'CreateUserSchema', response: 'User' },
  },
  '/api/users/:id': {
    methods: ['PUT', 'DELETE'],
    auth: true,
    roles: ['ADMIN'],
    put: { body: 'UpdateUserSchema', response: 'User' },
    delete: { response: { success: 'boolean' } },
  },
  '/api/employees': {
    methods: ['GET', 'POST'],
    auth: true,
    roles: ['ADMIN'],
    get: { query: null, response: 'Employee[]' },
    post: { body: 'CreateEmployeeSchema', response: 'Employee' },
  },
  '/api/employees/:id': {
    methods: ['PUT', 'DELETE'],
    auth: true,
    roles: ['ADMIN'],
    put: { body: 'UpdateEmployeeSchema', response: 'Employee' },
    delete: { response: { success: 'boolean' } },
  },
  '/api/fuel-types': {
    methods: ['GET', 'POST'],
    auth: true,
    get: { query: { status: 'OPEN | CLOSED | PENDING_APPROVAL | APPROVED | REJECTED' }, response: 'FuelType[]' },
    post: { body: 'CreateFuelTypeSchema', response: 'FuelType', roles: ['ADMIN'] },
  },
  '/api/fuel-types/:id': {
    methods: ['PUT', 'DELETE'],
    auth: true,
    roles: ['ADMIN'],
    put: { body: 'UpdateFuelTypeSchema', response: 'FuelType' },
    delete: { response: { success: 'boolean' } },
  },
  '/api/fuel-types/price': {
    method: 'POST',
    auth: true,
    roles: ['ADMIN'],
    body: { fuelTypeId: 'string', newPrice: 'number' },
    response: 'FuelPriceHistory',
  },
  '/api/pumps': {
    methods: ['GET', 'POST'],
    auth: true,
    get: { query: null, response: 'Pump[]' },
    post: { body: 'CreatePumpSchema', response: 'Pump', roles: ['ADMIN'] },
  },
  '/api/pumps/:id': {
    methods: ['PUT', 'DELETE'],
    auth: true,
    roles: ['ADMIN'],
    put: { body: 'UpdatePumpSchema', response: 'Pump' },
    delete: { response: { success: 'boolean' } },
  },
  '/api/fuel-stock/view': {
    method: 'GET',
    auth: true,
    response: 'FuelStockView[]',
    description: 'Returns current stock levels for cylinder visualization',
  },
  '/api/fuel-stock/opening': {
    method: 'POST',
    auth: true,
    roles: ['ADMIN'],
    body: { fuelTypeId: 'string', quantity: 'number', recordedAt: 'Date' },
    response: 'FuelDailyStock',
  },
  '/api/fuel-stock/closing': {
    method: 'POST',
    auth: true,
    roles: ['ADMIN'],
    body: { fuelTypeId: 'string', quantity: 'number', recordedAt: 'Date' },
    response: 'FuelDailyStock',
  },
  '/api/fuel-deliveries': {
    methods: ['GET', 'POST'],
    auth: true,
    get: { query: null, response: 'FuelDelivery[]' },
    post: { body: 'CreateFuelDeliverySchema', response: 'FuelDelivery', roles: ['ADMIN'] },
  },
  '/api/pump-shifts': {
    methods: ['GET', 'POST'],
    auth: true,
    get: { query: { status: 'OPEN | CLOSED | PENDING_APPROVAL | APPROVED | REJECTED' }, response: 'PumpShift[]' },
    post: { body: 'CreatePumpShiftSchema', response: 'PumpShift', roles: ['CASHIER'] },
  },
  '/api/pump-shifts/:id': {
    methods: ['GET', 'PUT'],
    auth: true,
    get: { response: 'PumpShift' },
    put: { body: 'ClosePumpShiftSchema', response: 'PumpShift', roles: ['CASHIER'] },
  },
  '/api/pump-shifts/:id/interim': {
    method: 'POST',
    auth: true,
    roles: ['CASHIER'],
    body: { amount: 'number', collectedAt: 'Date', remarks: 'string' },
    response: 'InterimHandover',
    description: 'Mid-shift cash collection for security',
  },
  '/api/pump-shifts/approve': {
    method: 'POST',
    auth: true,
    roles: ['ADMIN'],
    body: { shiftId: 'string', status: 'APPROVED | REJECTED', remarks: 'string' },
    response: 'PumpShift',
  },
  '/api/reports/sales': {
    method: 'GET',
    auth: true,
    query: { startDate: 'string', endDate: 'string', cashierId: 'string', fuelTypeId: 'string' },
    response: 'SalesReport',
  },
  '/api/reports/fuel-stock': {
    method: 'GET',
    auth: true,
    response: 'FuelStockReport',
  },
  '/api/salary': {
    methods: ['GET', 'POST'],
    auth: true,
    roles: ['ADMIN'],
    get: { query: { month: 'string', year: 'string', employeeId: 'string' }, response: 'SalaryRecord[]' },
    post: { body: 'CreateSalaryRecordSchema', response: 'SalaryRecord' },
  },
  '/api/salary/:id': {
    methods: ['PUT', 'DELETE'],
    auth: true,
    roles: ['ADMIN'],
    put: { body: 'UpdateSalaryRecordSchema', response: 'SalaryRecord' },
    delete: { response: { success: 'boolean' } },
  },
  '/api/debug/db-status': {
    method: 'GET',
    auth: false,
    response: 'DatabaseStatus',
    description: 'Check database connection and seeded data',
  },
} as const
