
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AdminFinancials: React.FC = () => {
  const revenueData = [
    { month: 'Jan', revenue: 245000, commission: 24500, payout: 220500 },
    { month: 'Feb', revenue: 280000, commission: 28000, payout: 252000 },
    { month: 'Mar', revenue: 315000, commission: 31500, payout: 283500 },
    { month: 'Apr', revenue: 290000, commission: 29000, payout: 261000 },
    { month: 'May', revenue: 350000, commission: 35000, payout: 315000 },
    { month: 'Jun', revenue: 385000, commission: 38500, payout: 346500 }
  ];

  const pendingPayouts = [
    {
      vendor: 'TechZone BD',
      amount: '৳45,000',
      orders: 23,
      period: 'Jun 1-15, 2024',
      status: 'pending'
    },
    {
      vendor: 'Fashion Hub BD',
      amount: '৳32,000',
      orders: 18,
      period: 'Jun 1-15, 2024',
      status: 'processing'
    },
    {
      vendor: 'Home Essentials',
      amount: '৳28,000',
      orders: 15,
      period: 'Jun 1-15, 2024',
      status: 'pending'
    }
  ];

  const financialStats = [
    {
      title: 'Total Revenue',
      value: '৳38,50,000',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Commission Earned',
      value: '৳3,85,000',
      change: '+12.8%',
      trend: 'up',
      icon: PieChart,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Payouts',
      value: '৳1,05,000',
      change: '+8.5%',
      trend: 'up',
      icon: Wallet,
      color: 'text-yellow-600'
    },
    {
      title: 'Processed Payouts',
      value: '৳2,80,000',
      change: '+18.3%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Generate Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Export Data</Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 bg-gray-50 rounded-lg`}>
                  <Icon size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center text-sm">
                  <TrendIcon 
                    size={16} 
                    className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} 
                  />
                  <span className={`ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Commission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Total Revenue" />
              <Line type="monotone" dataKey="commission" stroke="#EF4444" strokeWidth={2} name="Commission" />
              <Line type="monotone" dataKey="payout" stroke="#10B981" strokeWidth={2} name="Vendor Payouts" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payouts */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Vendor Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayouts.map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{payout.vendor}</h4>
                    <p className="text-sm text-gray-500">{payout.period}</p>
                    <p className="text-sm text-gray-500">{payout.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">{payout.amount}</div>
                    <Badge className={payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Process All Payouts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Electronics (10%)</span>
                <span className="font-bold text-gray-900">৳1,20,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Fashion (8%)</span>
                <span className="font-bold text-gray-900">৳95,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Home & Garden (12%)</span>
                <span className="font-bold text-gray-900">৳85,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Books (15%)</span>
                <span className="font-bold text-gray-900">৳65,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Others (10%)</span>
                <span className="font-bold text-gray-900">৳20,000</span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Commission</span>
                  <span className="text-green-600">৳3,85,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
