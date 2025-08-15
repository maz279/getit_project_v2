
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';

interface OrderStatsCardsProps {
  statusCounts: {
    all: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({ statusCounts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.all}</div>
          <p className="text-sm opacity-90">Total Orders</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.pending}</div>
          <p className="text-sm opacity-90">Pending</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.processing}</div>
          <p className="text-sm opacity-90">Processing</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.shipped}</div>
          <p className="text-sm opacity-90">Shipped</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.delivered}</div>
          <p className="text-sm opacity-90">Delivered</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
          <p className="text-sm opacity-90">Cancelled</p>
        </CardContent>
      </Card>
    </div>
  );
};
