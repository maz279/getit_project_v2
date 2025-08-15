
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, Package, Heart, BarChart3, Users, ShoppingBag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export const WishlistAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const performanceMetrics = [
    {
      title: 'Total Savings',
      titleBn: 'মোট সাশ্রয়',
      value: '৳15,500',
      usdValue: '$185',
      change: '+৳2,300',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Amount saved through price drops'
    },
    {
      title: 'Items Added',
      titleBn: 'যোগ করা পণ্য',
      value: '23',
      change: '+5 this week',
      trend: 'up',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'New items in your wishlist'
    },
    {
      title: 'Price Drops Detected',
      titleBn: 'দাম কমার সংখ্যা',
      value: '8',
      change: '2 new alerts',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Items with recent price reductions'
    },
    {
      title: 'Conversion Rate',
      titleBn: 'ক্রয় হার',
      value: '12.5%',
      change: '+2.1% improvement',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Wishlist to purchase conversion'
    }
  ];

  const engagementMetrics = [
    {
      label: 'Wishlist Adoption Rate',
      labelBn: 'উইশলিস্ট গ্রহণের হার',
      value: '78%',
      description: 'Users who create wishlists'
    },
    {
      label: 'Average Items per List',
      labelBn: 'প্রতি তালিকায় গড় পণ্য',
      value: '15.3',
      description: 'Items saved per user'
    },
    {
      label: 'Return Frequency',
      labelBn: 'ফিরে আসার হার',
      value: '4.2x/week',
      description: 'User return patterns'
    },
    {
      label: 'Social Shares',
      labelBn: 'সামাজিক শেয়ার',
      value: '156',
      description: 'Wishlist shares this month'
    }
  ];

  const topCategories = [
    { name: 'Electronics', nameBn: 'ইলেকট্রনিক্স', percentage: 35, items: 8 },
    { name: 'Fashion', nameBn: 'ফ্যাশন', percentage: 28, items: 6 },
    { name: 'Home & Garden', nameBn: 'ঘর ও বাগান', percentage: 20, items: 5 },
    { name: 'Beauty', nameBn: 'সৌন্দর্য', percentage: 17, items: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              Wishlist Analytics & Insights
            </CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                {metric.usdValue && (
                  <p className="text-sm text-gray-500">≈ {metric.usdValue}</p>
                )}
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.titleBn}</p>
                <p className="text-xs text-gray-500">{metric.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            User Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {engagementMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                <div className="text-xs text-gray-500">{metric.labelBn}</div>
                <div className="text-xs text-gray-400 mt-1">{metric.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="w-5 h-5 text-orange-600" />
            Wishlist Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500">({category.nameBn})</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">{category.percentage}%</div>
                  <div className="text-xs text-gray-500 w-16 text-right">{category.items} items</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Best Performing Categories</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Electronics (ইলেকট্রনিক্স)</span>
                  <span className="text-green-600">+15% conversion</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fashion (ফ্যাশন)</span>
                  <span className="text-green-600">+12% engagement</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Home & Garden (ঘর ও বাগান)</span>
                  <span className="text-green-600">+8% saves</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Seasonal Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Eid Shopping (ঈদ কেনাকাটা)</span>
                  <span className="text-blue-600">Peak season</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Winter Collection</span>
                  <span className="text-orange-600">Growing</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Festival Items (উৎসবের পণ্য)</span>
                  <span className="text-purple-600">Trending</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
