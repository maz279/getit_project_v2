
import React from 'react';
import { TrendingUp, BarChart3, Users, ShoppingCart } from 'lucide-react';

export const TrendingAnalytics: React.FC = () => {
  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      value: '2.5M+',
      label: 'Monthly Active Users',
      trend: '+15% this month',
      color: 'text-green-600'
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      value: '450K+',
      label: 'Orders This Month',
      trend: '+22% from last month',
      color: 'text-blue-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: '15K+',
      label: 'Verified Vendors',
      trend: '+8% new vendors',
      color: 'text-purple-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      value: '98.5%',
      label: 'Customer Satisfaction',
      trend: 'Consistently high',
      color: 'text-orange-600'
    }
  ];

  const trendingProducts = [
    { name: 'Winter Jackets', growth: '+45%', category: 'Fashion' },
    { name: 'Smart Watches', growth: '+38%', category: 'Electronics' },
    { name: 'Home Decor', growth: '+32%', category: 'Home & Garden' },
    { name: 'Health Supplements', growth: '+28%', category: 'Health & Beauty' }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">📊 Trending Analytics & Insights</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Real-time data showing what's popular, trending, and driving customer engagement across our platform. 
            Stay informed about market trends and customer preferences in Bangladesh.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className={`${stat.color} mb-3 flex justify-center`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-green-600 font-medium">{stat.trend}</div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">🚀 Fastest Growing Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.category}</div>
                </div>
                <div className="text-green-600 font-bold">{product.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
