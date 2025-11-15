import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const pumpId = searchParams.get('pumpId')

    let query = 'SELECT * FROM pump_shifts WHERE status = $1'
    const params: any[] = ['APPROVED']

    if (startDate && endDate) {
      query += ' AND end_time BETWEEN $2 AND $3'
      params.push(startDate, endDate)
    }

    if (pumpId) {
      const paramIndex = params.length + 1
      query += ` AND pump_id = $${paramIndex}`
      params.push(parseInt(pumpId))
    }

    query += ' ORDER BY end_time DESC'

    const shifts = await db.query(query, params)

    // Calculate summary statistics
    const totalSales = shifts.rows.reduce((sum, shift) => sum + parseFloat(shift.cash_received), 0)
    const totalLiters = shifts.rows.reduce((sum, shift) => sum + parseFloat(shift.liters_sold), 0)
    const totalShifts = shifts.rows.length

    // Group by fuel type
    const fuelTypeQuery = `
      SELECT 
        ft.name as fuel_type_name,
        ft.unit,
        SUM(ps.liters_sold) as total_liters,
        SUM(ps.cash_received) as total_sales,
        COUNT(ps.id) as shift_count
      FROM pump_shifts ps
      JOIN pumps p ON ps.pump_id = p.id
      JOIN fuel_types ft ON p.fuel_type_id = ft.id
      WHERE ps.status = 'APPROVED'
      ${startDate && endDate ? `AND ps.end_time BETWEEN '${startDate}' AND '${endDate}'` : ''}
      ${pumpId ? `AND ps.pump_id = ${pumpId}` : ''}
      GROUP BY ft.id, ft.name, ft.unit
      ORDER BY total_sales DESC
    `
    const fuelTypeSummary = await db.query(fuelTypeQuery)

    // Group by cashier
    const cashierQuery = `
      SELECT 
        u.name as cashier_name,
        COUNT(ps.id) as shift_count,
        SUM(ps.cash_received) as total_sales,
        SUM(ps.liters_sold) as total_liters
      FROM pump_shifts ps
      JOIN users u ON ps.cashier_id = u.id
      WHERE ps.status = 'APPROVED'
      ${startDate && endDate ? `AND ps.end_time BETWEEN '${startDate}' AND '${endDate}'` : ''}
      ${pumpId ? `AND ps.pump_id = ${pumpId}` : ''}
      GROUP BY u.id, u.name
      ORDER BY total_sales DESC
    `
    const cashierSummary = await db.query(cashierQuery)

    return NextResponse.json({
      shifts: shifts.rows,
      summary: {
        totalSales,
        totalLiters,
        totalShifts,
      },
      fuelTypeSummary: fuelTypeSummary.rows,
      cashierSummary: cashierSummary.rows,
    })
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    )
  }
}
