
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Package, DollarSign, Star, AlertTriangle, BarChart3, Users } from 'lucide-react';
import { ProductStats, PerformanceMetrics } from './types';

interface ProductsStatsCardsProps {
  stats: ProductStats;
  performance: PerformanceMetrics;
}

export const ProductsStatsCards: React.FC<ProductsStatsCardsProps> = ({ stats, performance }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalProducts)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className="bg-green-100 text-green-800">{formatNumber(stats.activeProducts)} Active</Badge>
            <Badge variant="secondary">{formatNumber(stats.inactiveProducts)} Inactive</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-red-600">{formatNumber(stats.outOfStock)} out of stock</span>
          </p>
        </CardContent>
      </Card>

      {/* Revenue Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-sm text-green-600">+{performance.salesGrowth}%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Profit: {formatCurrency(stats.totalProfit)} ({performance.profitMargin}% margin)
          </p>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 flex items-center">
            {stats.averageRating}
            <Star className="h-5 w-5 ml-1 fill-current" />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className="bg-yellow-100 text-yellow-800">{formatNumber(stats.totalReviews)} Reviews</Badge>
            <span className="text-xs text-muted-foreground">Satisfaction: {performance.customerSatisfaction}/5.0</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Return Rate: {performance.returnRate}%
          </p>
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.lowStock)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
            <Badge className="bg-orange-100 text-orange-800">Action Needed</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Turnover: {performance.inventoryTurnover}x per year
          </p>
        </CardContent>
      </Card>

      {/* Performance Metrics Row */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-purple-600">{performance.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{formatCurrency(performance.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-sm font-semibold text-gray-700">{performance.marketShare}%</div>
              <p className="text-xs text-muted-foreground">Market Share</p>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <div className="text-sm font-semibold text-green-600">{performance.salesGrowth}%</div>
              <p className="text-xs text-muted-foreground ml-1">Growth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <Users className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <Package className="h-5 w-5 mx-auto text-blue-600 mb-1" />
              <p className="text-xs font-medium text-blue-700">Add Products</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
              <BarChart3 className="h-5 w-5 mx-auto text-green-600 mb-1" />
              <p className="text-xs font-medium text-green-700">View Analytics</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
              <AlertTriangle className="h-5 w-5 mx-auto text-orange-600 mb-1" />
              <p className="text-xs font-medium text-orange-700">Stock Alerts</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <DollarSign className="h-5 w-5 mx-auto text-purple-600 mb-1" />
              <p className="text-xs font-medium text-purple-700">Bulk Pricing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
