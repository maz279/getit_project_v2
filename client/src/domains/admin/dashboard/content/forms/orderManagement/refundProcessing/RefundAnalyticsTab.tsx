
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart3, PieChart } from 'lucide-react';

interface RefundAnalyticsTabProps {
  stats: {
    processingTime: number;
    customerSatisfaction: number;
  };
}

export const RefundAnalyticsTab: React.FC<RefundAnalyticsTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
              Refund Trends (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Refund Trends Chart</p>
                <p className="text-sm text-gray-500">Refund patterns over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-green-600" />
              Refund by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-green-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <PieChart className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Category Analysis</p>
                <p className="text-sm text-gray-500">Refunds by product categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.processingTime} days</div>
              <div className="text-sm text-gray-600 mt-1">Average Processing Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.customerSatisfaction}/5</div>
              <div className="text-sm text-gray-600 mt-1">Customer Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-gray-600 mt-1">Auto-Approval Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">12%</div>
              <div className="text-sm text-gray-600 mt-1">Dispute Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
