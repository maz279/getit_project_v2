
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { BarChart3, TrendingUp, Star } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Delivery Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Delivery Performance Chart</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Delivery Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Delivery Trends Chart</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Delivery Time</span>
              <Badge className="bg-blue-100 text-blue-800">2.3 hours</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>On-Time Delivery Rate</span>
              <Badge className="bg-green-100 text-green-800">94.2%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Customer Satisfaction</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.7/5.0</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Failed Delivery Rate</span>
              <Badge className="bg-red-100 text-red-800">1.8%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Couriers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>RedX Delivery</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Pathao Courier</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.5</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Steadfast Courier</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
