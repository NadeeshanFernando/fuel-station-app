import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StockCylindersView } from '@/components/fuel-stock/stock-cylinders-view'
import { TankManagement } from '@/components/fuel-stock/tank-management'

export default function FuelStockPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fuel Stock</h1>
        <p className="text-muted-foreground">Monitor stock levels and manage tank configurations</p>
      </div>

      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">Stock View</TabsTrigger>
          <TabsTrigger value="tanks">Tank Management</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <StockCylindersView />
        </TabsContent>

        <TabsContent value="tanks">
          <TankManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
