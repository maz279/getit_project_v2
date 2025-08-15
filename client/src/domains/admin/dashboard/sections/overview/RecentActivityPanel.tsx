
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Star, TrendingUp, Activity, Clock } from 'lucide-react';

export const RecentActivityPanel: React.FC = () => {
  const recentOrders = [
    { 
      id: '#12345', 
      customer: 'John Doe', 
      product: 'iPhone 14', 
      amount: '৳85,000', 
      status: 'Delivered', 
      time: '2 min ago',
      avatar: 'JD'
    },
    { 
      id: '#12346', 
      customer: 'Jane Smith', 
      product: 'Samsung TV', 
      amount: '৳45,000', 
      status: 'Processing', 
      time: '5 min ago',
      avatar: 'JS'
    },
    { 
      id: '#12347', 
      customer: 'Bob Johnson', 
      product: 'Nike Shoes', 
      amount: '৳8,500', 
      status: 'Shipped', 
      time: '10 min ago',
      avatar: 'BJ'
    },
    { 
      id: '#12348', 
      customer: 'Alice Brown', 
      product: 'MacBook Pro', 
      amount: '৳125,000', 
      status: 'Pending', 
      time: '15 min ago',
      avatar: 'AB'
    },
  ];

  const topVendors = [
    { 
      name: 'TechHub BD', 
      sales: '৳2.5M', 
      orders: 1250, 
      rating: 4.8, 
      growth: '+12%',
      category: 'Electronics'
    },
    { 
      name: 'Fashion Point', 
      sales: '৳1.8M', 
      orders: 890, 
      rating: 4.6, 
      growth: '+8%',
      category: 'Fashion'
    },
    { 
      name: 'Home Essentials', 
      sales: '৳1.2M', 
      orders: 650, 
      rating: 4.7, 
      growth: '+15%',
      category: 'Home & Garden'
    },
    { 
      name: 'Sports World', 
      sales: '৳980K', 
      orders: 520, 
      rating: 4.5, 
      growth: '+5%',
      category: 'Sports'
    },
  ];

  const performanceMetrics = [
    { 
      title: 'Conversion Rate', 
      value: 68, 
      color: 'bg-blue-500',
      trend: '+2%',
      description: 'Visitors to customers'
    },
    { 
      title: 'Customer Satisfaction', 
      value: 92, 
      color: 'bg-green-500',
      trend: '+5%',
      description: 'Based on reviews'
    },
    { 
      title: 'Return Rate', 
      value: 8, 
      color: 'bg-red-500',
      trend: '-1%',
      description: 'Products returned'
    }
  ];

  const systemActivities = [
    { action: 'New order received', time: '2 min ago', type: 'order' },
    { action: 'Payment processed', time: '5 min ago', type: 'payment' },
    { action: 'Product inventory updated', time: '8 min ago', type: 'inventory' },
    { action: 'New vendor registered', time: '12 min ago', type: 'vendor' },
    { action: 'System backup completed', time: '15 min ago', type: 'system' }
  ];

  return (
    <>
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Orders
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{order.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{order.id}</span>
                        <Badge variant={
                          order.status === 'Delivered' ? 'default' :
                          order.status === 'Processing' ? 'secondary' :
                          order.status === 'Shipped' ? 'outline' : 'destructive'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer} • {order.product}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {order.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">View All Orders</Button>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'inventory' ? 'bg-orange-500' :
                    activity.type === 'vendor' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">View Activity Log</Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Top Performing Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topVendors.map((vendor, index) => (
              <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{vendor.rating}</span>
                      <span>•</span>
                      <span>{vendor.orders} orders</span>
                    </div>
                    <p className="text-xs text-gray-500">{vendor.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{vendor.sales}</p>
                  <p className="text-sm text-green-600">{vendor.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {metric.title}
                <span className={`text-sm ${metric.title === 'Return Rate' ? 'text-green-600' : 'text-green-600'}`}>
                  {metric.trend}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1">
                  <Progress value={metric.value} className="h-3" />
                </div>
                <span className="text-lg font-bold">{metric.value}%</span>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
