
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, AlertCircle } from 'lucide-react';

export const PayoutAnalyticsTab: React.FC = () => {
  // Mock analytics data
  const monthlyPayouts = [
    { month: 'Jan', amount: 2400000, count: 45 },
    { month: 'Feb', amount: 1800000, count: 38 },
    { month: 'Mar', amount: 3200000, count: 62 },
    { month: 'Apr', amount: 2800000, count: 54 },
    { month: 'May', amount: 3600000, count: 71 },
    { month: 'Jun', amount: 4200000, count: 83 }
  ];

  const paymentMethodData = [
    { name: 'Bank Transfer', value: 65, color: '#3B82F6' },
    { name: 'Mobile Banking', value: 25, color: '#10B981' },
    { name: 'Digital Wallet', value: 8, color: '#F59E0B' },
    { name: 'Check', value: 2, color: '#EF4444' }
  ];

  const processingTimeData = [
    { status: 'Same Day', count: 45, percentage: 38 },
    { status: '1-2 Days', count: 52, percentage: 44 },
    { status: '3-5 Days', count: 18, percentage: 15 },
    { status: '> 5 Days', count: 4, percentage: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold">৳18.7M</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.3%</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold">1.8 Days</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">-0.3 days</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold">342</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.1%</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">98.7%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+0.4%</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payout Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payout Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ amount: {}, count: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPayouts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Amount (BDT)" />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name="Count" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingTimeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{item.status}</div>
                      <div className="text-sm text-gray-500">{item.count} payouts</div>
                    </div>
                  </div>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'TechStore Bangladesh', amount: 450000, payouts: 12 },
                { name: 'Fashion World', amount: 380000, payouts: 9 },
                { name: 'Home & Garden', amount: 320000, payouts: 8 },
                { name: 'Electronics Hub', amount: 280000, payouts: 7 },
                { name: 'Sports Corner', amount: 250000, payouts: 6 }
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.payouts} payouts</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">৳{vendor.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
