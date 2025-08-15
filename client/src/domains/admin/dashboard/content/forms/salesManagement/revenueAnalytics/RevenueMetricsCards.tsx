
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import { RevenueMetrics } from './types';

interface RevenueMetricsCardsProps {
  metrics: RevenueMetrics;
}

export const RevenueMetricsCards: React.FC<RevenueMetricsCardsProps> = ({ metrics }) => {
  const formatCurrency = (amount: number) => `৳${(amount / 1000000).toFixed(1)}M`;
  const formatPercentage = (percent: number) => `${percent > 0 ? '+' : ''}${percent}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">{formatPercentage(metrics.revenueGrowth)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">{formatPercentage(metrics.monthlyGrowth)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Avg Order Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳{metrics.avgOrderValue.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">+5.2%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Customer LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳{metrics.customerLifetimeValue.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs opacity-90">+8.7%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</div>
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            +0.3%
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.returnOnInvestment}%</div>
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            +2.1%
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">৳{metrics.dailyRevenue.toLocaleString()}</div>
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12.5%
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Yearly Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.yearlyRevenue)}</div>
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            +18.3%
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
