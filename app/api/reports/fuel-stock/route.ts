import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active fuel types with color
    const fuelTypes = await prisma.fuelType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    // Mock current stock data (you'll need to add proper stock tracking tables)
    const currentStock = fuelTypes.map((ft) => ({
      id: ft.id,
      name: ft.name,
      color: ft.color,
      unit: 'Liters',
      capacity: 10000, // Mock capacity
      current_stock: Math.random() * 10000, // Mock current stock
      min_stock_alert: 2000, // Mock alert level
      stock_percentage: 0,
      stock_status: 'normal',
    }))

    // Calculate percentages and status
    currentStock.forEach((stock) => {
      stock.stock_percentage = (stock.current_stock / stock.capacity) * 100
      if (stock.current_stock <= stock.min_stock_alert) {
        stock.stock_status = 'critical'
      } else if (stock.current_stock <= stock.min_stock_alert * 1.5) {
        stock.stock_status = 'low'
      } else if (stock.current_stock >= stock.capacity * 0.9) {
        stock.stock_status = 'high'
      } else {
        stock.stock_status = 'normal'
      }
    })

    // Get delivery history (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deliveries = await prisma.fuelDelivery.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        fuelType: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 20,
    })

    const formattedDeliveries = deliveries.map((d) => ({
      id: d.id,
      fuel_type_name: d.fuelType.name,
      quantity_delivered: d.quantityLiters.toString(),
      delivery_date: d.date.toISOString(),
      supplier_name: 'Supplier Co.', // Mock
      invoice_number: d.invoiceNumber || 'N/A',
      received_by: 'Admin', // Mock
    }))

    // Get stock history (mock data for now)
    const stockHistory = [] as any[]

    return NextResponse.json({
      currentStock,
      deliveries: formattedDeliveries,
      stockHistory,
      trends: [],
    })
  } catch (error) {
    console.error('Error fetching fuel stock report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel stock report' },
      { status: 500 }
    )
  }
}
