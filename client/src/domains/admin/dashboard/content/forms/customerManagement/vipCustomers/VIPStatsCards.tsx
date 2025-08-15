
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Crown, DollarSign, TrendingUp, Star } from 'lucide-react';
import { VIPCustomer } from './types';

interface VIPStatsCardsProps {
  customers: VIPCustomer[];
}

export const VIPStatsCards: React.FC<VIPStatsCardsProps> = ({ customers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Crown className="h-6 w-6 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
          <div className="text-sm text-gray-500">Total VIP Customers</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <DollarSign className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ${customers.reduce((acc, customer) => acc + customer.lifetimeValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Lifetime Value</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-green-500">+12%</div>
          <div className="text-sm text-gray-500">Growth This Month</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Star className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">98%</div>
          <div className="text-sm text-gray-500">Satisfaction Rate</div>
        </CardContent>
      </Card>
    </div>
  );
};
