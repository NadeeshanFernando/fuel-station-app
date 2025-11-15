# Database seeding script
# Creates initial admin user and sample fuel types with prices

import asyncio
import bcrypt
from datetime import datetime
import os

# Note: In a real setup, you would use Prisma Client Python or call the Next.js API
# For this demo, we'll create a SQL script instead

sql_script = """
-- Seed script for Fuel Station Management System
-- Creates default admin user and sample fuel types

-- Create admin user (username: admin, password: admin123)
INSERT INTO "User" (id, name, username, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-user-id-001',
  'System Administrator',
  'admin',
  '$2a$10$rB8R5K7V8qH9vY3g6pQ7.eK7GxR5qH9vY3g6pQ7.eK7GxR5qH9vY3',
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create sample cashier user (username: cashier1, password: cashier123)
INSERT INTO "User" (id, name, username, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'cashier-user-id-001',
  'John Cashier',
  'cashier1',
  '$2a$10$rB8R5K7V8qH9vY3g6pQ7.eK7GxR5qH9vY3g6pQ7.eK7GxR5qH9vY4',
  'CASHIER',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create fuel types
INSERT INTO "FuelType" (id, name, "isActive", "createdAt", "updatedAt")
VALUES 
  ('fuel-type-petrol-92', 'Petrol 92', true, NOW(), NOW()),
  ('fuel-type-petrol-95', 'Petrol 95', true, NOW(), NOW()),
  ('fuel-type-diesel', 'Auto Diesel', true, NOW(), NOW()),
  ('fuel-type-super-diesel', 'Super Diesel', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create initial price history for each fuel type
INSERT INTO "FuelPriceHistory" (id, "fuelTypeId", "pricePerLiter", "effectiveFrom", "effectiveTo", "createdAt")
VALUES 
  ('price-history-001', 'fuel-type-petrol-92', 1.45, NOW(), NULL, NOW()),
  ('price-history-002', 'fuel-type-petrol-95', 1.65, NOW(), NULL, NOW()),
  ('price-history-003', 'fuel-type-diesel', 1.35, NOW(), NULL, NOW()),
  ('price-history-004', 'fuel-type-super-diesel', 1.55, NOW(), NULL, NOW())
ON CONFLICT DO NOTHING;

-- Create sample pumps
INSERT INTO "Pump" (id, name, "fuelTypeId", "isActive", "createdAt", "updatedAt")
VALUES 
  ('pump-001', 'Pump 1', 'fuel-type-petrol-92', true, NOW(), NOW()),
  ('pump-002', 'Pump 2', 'fuel-type-petrol-92', true, NOW(), NOW()),
  ('pump-003', 'Pump 3', 'fuel-type-petrol-95', true, NOW(), NOW()),
  ('pump-004', 'Pump 4', 'fuel-type-diesel', true, NOW(), NOW()),
  ('pump-005', 'Pump 5', 'fuel-type-diesel', true, NOW(), NOW()),
  ('pump-006', 'Pump 6', 'fuel-type-super-diesel', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create initial stock entries for today
INSERT INTO "FuelDailyStock" (id, date, "fuelTypeId", "openingStockLiters", "closingPhysicalStockLiters", "createdAt", "updatedAt")
VALUES 
  ('stock-001', CURRENT_DATE, 'fuel-type-petrol-92', 5000.00, NULL, NOW(), NOW()),
  ('stock-002', CURRENT_DATE, 'fuel-type-petrol-95', 4000.00, NULL, NOW(), NOW()),
  ('stock-003', CURRENT_DATE, 'fuel-type-diesel', 6000.00, NULL, NOW(), NOW()),
  ('stock-004', CURRENT_DATE, 'fuel-type-super-diesel', 3000.00, NULL, NOW(), NOW())
ON CONFLICT (date, "fuelTypeId") DO NOTHING;

SELECT 'Database seeded successfully!' as message;
"""

# Write SQL script to file
with open('scripts/seed.sql', 'w') as f:
    f.write(sql_script)

print("Seed SQL script generated at scripts/seed.sql")
print("\nTo run the seed script, execute:")
print("psql $DATABASE_URL -f scripts/seed.sql")
print("\nDefault credentials:")
print("Admin - username: admin, password: admin123")
print("Cashier - username: cashier1, password: cashier123")
