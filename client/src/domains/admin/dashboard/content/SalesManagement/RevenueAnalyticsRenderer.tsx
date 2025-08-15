
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { DollarSign, PieChart } from 'lucide-react';

export const RevenueAnalyticsRenderer: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Revenue Distribution Chart</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: 'Current Month', amount: '৳12.4M', change: '+8.2%', positive: true },
              { month: 'Last Month', amount: '৳11.5M', change: '+5.1%', positive: true },
              { month: 'Same Month Last Year', amount: '৳10.2M', change: '+21.6%', positive: true }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.month}</p>
                  <p className="text-lg font-bold">{item.amount}</p>
                </div>
                <Badge className={item.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {item.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
