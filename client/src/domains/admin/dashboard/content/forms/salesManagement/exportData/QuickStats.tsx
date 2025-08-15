
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const QuickStats: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Orders</span>
            <span className="font-medium">15,420</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Revenue</span>
            <span className="font-medium">৳2.4M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Customers</span>
            <span className="font-medium">8,750</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Products</span>
            <span className="font-medium">1,240</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
