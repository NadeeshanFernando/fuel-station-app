import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'System Administrator',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('Created admin user:', admin.username, '| ID:', admin.id)

  // Create cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10)
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier1' },
    update: {},
    create: {
      name: 'John Cashier',
      username: 'cashier1',
      passwordHash: cashierPassword,
      role: 'CASHIER',
      isActive: true,
    },
  })
  console.log('Created cashier user:', cashier.username, '| ID:', cashier.id)

  const petrol92 = await prisma.fuelType.upsert({
    where: { name: 'Petrol 92' },
    update: { 
      color: '#ef4444',
      tankCapacity: 10000,
      minStockAlert: 1000,
      currentStock: 5000,
    },
    create: {
      name: 'Petrol 92',
      color: '#ef4444', // Red
      tankCapacity: 10000,
      minStockAlert: 1000,
      currentStock: 5000,
      isActive: true,
    },
  })

  const petrol95 = await prisma.fuelType.upsert({
    where: { name: 'Petrol 95' },
    update: { 
      color: '#f97316',
      tankCapacity: 8000,
      minStockAlert: 800,
      currentStock: 4000,
    },
    create: {
      name: 'Petrol 95',
      color: '#f97316', // Orange
      tankCapacity: 8000,
      minStockAlert: 800,
      currentStock: 4000,
      isActive: true,
    },
  })

  const diesel = await prisma.fuelType.upsert({
    where: { name: 'Auto Diesel' },
    update: { 
      color: '#3b82f6',
      tankCapacity: 12000,
      minStockAlert: 1200,
      currentStock: 6000,
    },
    create: {
      name: 'Auto Diesel',
      color: '#3b82f6', // Blue
      tankCapacity: 12000,
      minStockAlert: 1200,
      currentStock: 6000,
      isActive: true,
    },
  })

  const superDiesel = await prisma.fuelType.upsert({
    where: { name: 'Super Diesel' },
    update: { 
      color: '#8b5cf6',
      tankCapacity: 8000,
      minStockAlert: 800,
      currentStock: 3000,
    },
    create: {
      name: 'Super Diesel',
      color: '#8b5cf6', // Purple
      tankCapacity: 8000,
      minStockAlert: 800,
      currentStock: 3000,
      isActive: true,
    },
  })
  console.log('Created fuel types with colors and tank configuration')

  // Delete existing price history for these fuel types (for idempotent seeding)
  await prisma.fuelPriceHistory.deleteMany({
    where: {
      fuelTypeId: {
        in: [petrol92.id, petrol95.id, diesel.id, superDiesel.id],
      },
    },
  })

  // Create fresh price history
  await prisma.fuelPriceHistory.create({
    data: {
      fuelTypeId: petrol92.id,
      pricePerLiter: 1.45,
      effectiveFrom: new Date(),
    },
  })

  await prisma.fuelPriceHistory.create({
    data: {
      fuelTypeId: petrol95.id,
      pricePerLiter: 1.65,
      effectiveFrom: new Date(),
    },
  })

  await prisma.fuelPriceHistory.create({
    data: {
      fuelTypeId: diesel.id,
      pricePerLiter: 1.35,
      effectiveFrom: new Date(),
    },
  })

  await prisma.fuelPriceHistory.create({
    data: {
      fuelTypeId: superDiesel.id,
      pricePerLiter: 1.55,
      effectiveFrom: new Date(),
    },
  })
  console.log('Created price history')

  // Create pumps
  await prisma.pump.upsert({
    where: { name: 'Pump 1' },
    update: {},
    create: {
      name: 'Pump 1',
      fuelTypeId: petrol92.id,
      isActive: true,
    },
  })

  await prisma.pump.upsert({
    where: { name: 'Pump 2' },
    update: {},
    create: {
      name: 'Pump 2',
      fuelTypeId: petrol92.id,
      isActive: true,
    },
  })

  await prisma.pump.upsert({
    where: { name: 'Pump 3' },
    update: {},
    create: {
      name: 'Pump 3',
      fuelTypeId: petrol95.id,
      isActive: true,
    },
  })

  await prisma.pump.upsert({
    where: { name: 'Pump 4' },
    update: {},
    create: {
      name: 'Pump 4',
      fuelTypeId: diesel.id,
      isActive: true,
    },
  })

  await prisma.pump.upsert({
    where: { name: 'Pump 5' },
    update: {},
    create: {
      name: 'Pump 5',
      fuelTypeId: diesel.id,
      isActive: true,
    },
  })

  await prisma.pump.upsert({
    where: { name: 'Pump 6' },
    update: {},
    create: {
      name: 'Pump 6',
      fuelTypeId: superDiesel.id,
      isActive: true,
    },
  })
  console.log('Created pumps')

  // Create initial stock for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.fuelDailyStock.upsert({
    where: {
      date_fuelTypeId: {
        date: today,
        fuelTypeId: petrol92.id,
      },
    },
    update: {},
    create: {
      date: today,
      fuelTypeId: petrol92.id,
      openingStockLiters: 5000.0,
    },
  })

  await prisma.fuelDailyStock.upsert({
    where: {
      date_fuelTypeId: {
        date: today,
        fuelTypeId: petrol95.id,
      },
    },
    update: {},
    create: {
      date: today,
      fuelTypeId: petrol95.id,
      openingStockLiters: 4000.0,
    },
  })

  await prisma.fuelDailyStock.upsert({
    where: {
      date_fuelTypeId: {
        date: today,
        fuelTypeId: diesel.id,
      },
    },
    update: {},
    create: {
      date: today,
      fuelTypeId: diesel.id,
      openingStockLiters: 6000.0,
    },
  })

  await prisma.fuelDailyStock.upsert({
    where: {
      date_fuelTypeId: {
        date: today,
        fuelTypeId: superDiesel.id,
      },
    },
    update: {},
    create: {
      date: today,
      fuelTypeId: superDiesel.id,
      openingStockLiters: 3000.0,
    },
  })
  console.log('Created initial fuel stock')

  console.log('\n✅ Database seeded successfully!')
  console.log('\nDefault login credentials:')
  console.log('Admin:   username: admin     password: admin123')
  console.log('Cashier: username: cashier1  password: cashier123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
