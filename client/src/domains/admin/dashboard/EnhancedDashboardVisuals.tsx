
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Star,
  Clock,
  Target,
  Zap,
  Award,
  Activity,
  Globe,
  Heart,
  Shield,
  Bell
} from 'lucide-react';

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}

const SimplePieChart: React.FC<PieChartProps> = ({ data, size = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      path: `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArc},1 ${x2},${y2} z`,
      percentage: Math.round((item.value / total) * 100)
    };
  });

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            style={{ animation: `scale-in 0.6s ease-out ${index * 0.1}s both` }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
};

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span className="font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export const EnhancedDashboardVisuals: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const salesData = [
    { name: 'Electronics', value: 45, color: '#3B82F6' },
    { name: 'Fashion', value: 30, color: '#10B981' },
    { name: 'Home', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#EF4444' }
  ];

  const userTypeData = [
    { name: 'Premium', value: 25, color: '#8B5CF6' },
    { name: 'Regular', value: 60, color: '#06B6D4' },
    { name: 'New', value: 15, color: '#84CC16' }
  ];

  const orderStatusData = [
    { name: 'Delivered', value: 70, color: '#10B981' },
    { name: 'Processing', value: 20, color: '#F59E0B' },
    { name: 'Pending', value: 8, color: '#EF4444' },
    { name: 'Cancelled', value: 2, color: '#6B7280' }
  ];

  const revenueData = [
    { name: 'Product Sales', value: 65, color: '#3B82F6' },
    { name: 'Shipping', value: 20, color: '#10B981' },
    { name: 'Services', value: 10, color: '#F59E0B' },
    { name: 'Others', value: 5, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-all duration-500 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ৳ <AnimatedCounter end={234567} />
                </p>
                <div className="flex items-center text-blue-100 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full animate-pulse">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all duration-500 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">
                  <AnimatedCounter end={45678} />
                </p>
                <div className="flex items-center text-green-100 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+8.3% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full animate-pulse">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white transform transition-all duration-500 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold">
                  <AnimatedCounter end={1234} />
                </p>
                <div className="flex items-center text-purple-100 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+15.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full animate-pulse">
                <Package className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-orange-500 to-orange-600 text-white transform transition-all duration-500 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">
                  <AnimatedCounter end={8901} />
                </p>
                <div className="flex items-center text-orange-100 text-sm mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+6.7% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full animate-pulse">
                <ShoppingCart className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-600" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center">
              <SimplePieChart data={salesData} size={100} />
              <div className="mt-3 space-y-1 w-full">
                {salesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-green-600" />
              User Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center">
              <SimplePieChart data={userTypeData} size={100} />
              <div className="mt-3 space-y-1 w-full">
                {userTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-orange-600" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center">
              <SimplePieChart data={orderStatusData} size={100} />
              <div className="mt-3 space-y-1 w-full">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
              Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center">
              <SimplePieChart data={revenueData} size={100} />
              <div className="mt-3 space-y-1 w-full">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Eye, label: 'Page Views', value: '2.4M', change: '+12%', color: 'blue' },
          { icon: Star, label: 'Avg Rating', value: '4.8', change: '+0.2', color: 'yellow' },
          { icon: Clock, label: 'Avg Response', value: '2.3h', change: '-15%', color: 'green' },
          { icon: Activity, label: 'Server Uptime', value: '99.9%', change: '+0.1%', color: 'green' },
          { icon: Shield, label: 'Security Score', value: '95%', change: '+3%', color: 'purple' },
          { icon: Globe, label: 'Global Reach', value: '45', change: '+5', color: 'cyan' }
        ].map((metric, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: `${0.8 + index * 0.1}s` }}
          >
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-2 rounded-full bg-${metric.color}-100 mb-2`}>
                <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
              </div>
              <div className="text-lg font-bold text-gray-900">{metric.value}</div>
              <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
              <Badge 
                variant={metric.change.startsWith('+') ? 'default' : 'secondary'}
                className="text-xs"
              >
                {metric.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <Card className={`hover:shadow-lg transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { icon: '🎉', text: 'New record: 1,000 orders today!', time: '2 min ago', type: 'success' },
              { icon: '💰', text: 'Revenue milestone: ৳50L achieved', time: '5 min ago', type: 'info' },
              { icon: '⭐', text: 'Platform rating improved to 4.8/5', time: '10 min ago', type: 'success' },
              { icon: '🚀', text: 'New feature: AI recommendations live', time: '15 min ago', type: 'info' },
              { icon: '🔔', text: '500+ new vendor registrations today', time: '20 min ago', type: 'warning' }
            ].map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 rounded-lg border-l-4 transition-all duration-300 hover:bg-gray-50 ${
                  activity.type === 'success' ? 'bg-green-50 border-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
                style={{ 
                  animation: `slide-in-right 0.5s ease-out ${index * 0.1}s both`,
                  transform: 'translateX(100%)'
                }}
              >
                <span className="text-2xl mr-3">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
