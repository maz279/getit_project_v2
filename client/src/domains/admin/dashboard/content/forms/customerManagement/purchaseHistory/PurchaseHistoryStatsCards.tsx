
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { ShoppingBag, Users, DollarSign, TrendingUp, Repeat, Calendar } from 'lucide-react';
import { PurchaseAnalytics } from './types';

interface PurchaseHistoryStatsCardsProps {
  analytics: PurchaseAnalytics;
}

export const PurchaseHistoryStatsCards: React.FC<PurchaseHistoryStatsCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.totalCustomers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">Total Customers</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <ShoppingBag className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.totalOrders.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">Total Orders</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <DollarSign className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ৳{(analytics.totalRevenue / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500 text-center">Total Revenue</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ৳{analytics.averageOrderValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">Avg Order Value</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Repeat className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(analytics.repeatCustomerRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">Repeat Rate</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Calendar className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.averageOrdersPerCustomer.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 text-center">Orders/Customer</div>
        </CardContent>
      </Card>
    </div>
  );
};
