'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesReportView } from '@/components/reports/sales-report-view'
import { FuelStockView } from '@/components/reports/fuel-stock-view'
import { BarChart3, Droplet } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View comprehensive sales and fuel stock reports with visualizations
        </p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="fuel-stock" className="gap-2">
            <Droplet className="h-4 w-4" />
            Fuel Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReportView />
        </TabsContent>

        <TabsContent value="fuel-stock">
          <FuelStockView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
