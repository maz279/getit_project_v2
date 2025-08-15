
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Globe } from 'lucide-react';

const regionRevenue = [
  { region: 'Dhaka', revenue: 3200000, growth: 14.5, orders: 12500 },
  { region: 'Chittagong', revenue: 1800000, growth: 12.3, orders: 7200 },
  { region: 'Sylhet', revenue: 950000, growth: 16.8, orders: 3800 },
  { region: 'Rajshahi', revenue: 720000, growth: 9.2, orders: 2900 },
  { region: 'Khulna', revenue: 650000, growth: 11.7, orders: 2600 }
];

export const RegionalTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Revenue Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regionRevenue.map((region, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {region.region}
                </h4>
                <Badge className={region.growth > 15 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  +{region.growth}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p className="font-bold">৳{(region.revenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-gray-600">Orders</p>
                  <p className="font-bold">{region.orders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Order</p>
                  <p className="font-bold">৳{Math.round(region.revenue / region.orders)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
