
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { ShoppingBag, Check, Clock, Users } from 'lucide-react';

interface BulkActionStatsProps {
  totalOrders: number;
  selectedOrders: number;
}

export const BulkActionStats: React.FC<BulkActionStatsProps> = ({ totalOrders, selectedOrders }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected Orders</p>
              <p className="text-2xl font-bold text-gray-900">{selectedOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Actions</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Affected Customers</p>
              <p className="text-2xl font-bold text-gray-900">{selectedOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
