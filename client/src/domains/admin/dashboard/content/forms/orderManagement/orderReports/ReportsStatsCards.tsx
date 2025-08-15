
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ShoppingCart, DollarSign, Users, TrendingUp, RotateCcw, Clock, Star, Target } from 'lucide-react';
import { OrderReportsStats } from './types';

interface ReportsStatsCardsProps {
  data: OrderReportsStats;
}

export const ReportsStatsCards: React.FC<ReportsStatsCardsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalOrders)}</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12.5% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +18.7% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <Target className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +5.2% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.conversionRate}%</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +0.8% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalCustomers)}</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +15.3% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
          <RotateCcw className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.returnRate}%</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            -0.5% from last month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fulfillment Time</CardTitle>
          <Clock className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.fulfillmentTime} days</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            -0.3 days improved
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          <Star className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.customerSatisfaction}/5.0</div>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +0.2 from last month
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
