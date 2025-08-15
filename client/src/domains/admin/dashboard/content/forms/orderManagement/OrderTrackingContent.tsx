
import React from 'react';
import { Truck, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

export const OrderTrackingContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Order Tracking Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Live Tracking Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Package className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Interactive Tracking Map</p>
                <p className="text-sm text-gray-400">Real-time delivery locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>On-time Delivery Rate</span>
                <Badge className="bg-green-100 text-green-800">94.5%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Delivery Time</span>
                <Badge className="bg-blue-100 text-blue-800">2.3 days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Customer Satisfaction</span>
                <Badge className="bg-purple-100 text-purple-800">4.7/5.0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
