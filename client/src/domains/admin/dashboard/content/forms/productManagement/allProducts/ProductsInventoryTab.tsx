
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Warehouse, AlertTriangle, TrendingDown, Package, MapPin, Calendar } from 'lucide-react';
import { InventoryData, LowStockAlert } from './types';

interface ProductsInventoryTabProps {
  inventoryData: InventoryData;
  lowStockAlerts: LowStockAlert[];
}

export const ProductsInventoryTab: React.FC<ProductsInventoryTabProps> = ({
  inventoryData,
  lowStockAlerts
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Warehouse Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Warehouse className="h-5 w-5 mr-2" />
            Warehouse Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventoryData.warehouseDistribution.map((warehouse, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{warehouse.warehouse}</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    {warehouse.utilization}% Full
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {warehouse.location}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {warehouse.totalItems.toLocaleString()} items
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: {formatCurrency(warehouse.value)}
                  </div>
                  <Progress value={warehouse.utilization} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Low Stock Alerts ({lowStockAlerts.length})
            </span>
            <Button size="sm">View All Alerts</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockAlerts.map((alert, index) => (
              <div key={index} className="border rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{alert.productName}</h4>
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">SKU</p>
                    <p className="font-mono">{alert.sku}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Stock</p>
                    <p className="font-semibold text-red-600">{alert.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Min Stock</p>
                    <p className="font-semibold">{alert.minStock}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Suggested Order</p>
                    <p className="font-semibold text-green-600">{alert.suggestedReorder}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Est. stockout: {alert.estimatedStockoutDate}
                  </div>
                  <div className="text-sm text-gray-600">
                    Vendor: {alert.vendor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Movement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Recent Stock Movement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryData.stockMovement.map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{movement.date}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-semibold">+{movement.inbound}</p>
                    <p className="text-gray-500">Inbound</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-600 font-semibold">-{movement.outbound}</p>
                    <p className="text-gray-500">Outbound</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${movement.adjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.adjustments >= 0 ? '+' : ''}{movement.adjustments}
                    </p>
                    <p className="text-gray-500">Adjustments</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${movement.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.net >= 0 ? '+' : ''}{movement.net}
                    </p>
                    <p className="text-gray-500">Net</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dead Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-gray-500" />
            Dead Stock Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryData.deadStock.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.productName}</h4>
                  <Badge variant="secondary">{item.daysInStock} days</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Stock Quantity</p>
                    <p className="font-semibold">{item.stock}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Sold</p>
                    <p className="font-semibold">{item.lastSold}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Days in Stock</p>
                    <p className="font-semibold text-orange-600">{item.daysInStock}</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Recommendation:</p>
                  <p className="text-sm text-yellow-700">{item.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
