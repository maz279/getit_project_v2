/**
 * Phase 4: Advanced Analytics & Intelligence
 * Real-Time Analytics Dashboard - Live Data Streaming
 * Amazon.com/Shopee.sg-level Real-Time Monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Activity, 
  Users, 
  ShoppingCart,
  Eye,
  Globe,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeAnalyticsProps {
  className?: string;
}

interface RealTimeData {
  liveMetrics: LiveMetrics;
  userActivity: UserActivity;
  salesActivity: SalesActivity;
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceData[];
  geographicData: GeographicData[];
  recentEvents: RecentEvent[];
  alerts: RealTimeAlert[];
  performanceMetrics: PerformanceMetrics;
}

interface LiveMetrics {
  activeUsers: number;
  pageViews: number;
  sessionsToday: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  revenueToday: number;
  ordersToday: number;
  cartAdditions: number;
  checkoutStarts: number;
  lastUpdate: string;
}

interface UserActivity {
  currentUsers: number;
  peakUsers: number;
  newUsers: number;
  returningUsers: number;
  usersByHour: HourlyData[];
  topPages: PageData[];
  userJourney: JourneyStep[];
}

interface SalesActivity {
  realtimeSales: number;
  orderVolume: number;
  averageOrderValue: number;
  topSellingProducts: ProductSales[];
  salesByCategory: CategorySales[];
  recentOrders: RecentOrder[];
  conversionFunnel: FunnelStep[];
}

interface TrafficSource {
  source: string;
  users: number;
  percentage: number;
  conversionRate: number;
  revenue: number;
  growth: number;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
  conversions: number;
  revenue: number;
}

interface GeographicData {
  location: string;
  users: number;
  percentage: number;
  revenue: number;
  averageSessionDuration: number;
}

interface RecentEvent {
  id: string;
  type: 'purchase' | 'signup' | 'cart_addition' | 'page_view' | 'search';
  description: string;
  timestamp: string;
  value?: number;
  location?: string;
  device?: string;
}

interface RealTimeAlert {
  id: string;
  type: 'spike' | 'drop' | 'anomaly' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  metric: string;
  message: string;
  currentValue: number;
  expectedValue: number;
  timestamp: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  serverResponseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
  concurrent: number;
}

interface HourlyData {
  hour: string;
  users: number;
  sessions: number;
  revenue: number;
}

interface PageData {
  path: string;
  pageViews: number;
  uniqueViews: number;
  averageTime: number;
  bounceRate: number;
}

interface JourneyStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

interface ProductSales {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  quantity: number;
}

interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
  growth: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  location: string;
  timestamp: string;
  items: number;
}

interface FunnelStep {
  step: string;
  users: number;
  conversionRate: number;
}

const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({
  className,
}) => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sales' | 'performance'>('overview');
  const [isLive, setIsLive] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(3000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealTimeData = () => {
      const mockData: RealTimeData = {
        liveMetrics: {
          activeUsers: 2847,
          pageViews: 45623,
          sessionsToday: 12847,
          conversionRate: 3.8,
          averageSessionDuration: 8.5,
          bounceRate: 32.1,
          revenueToday: 2845000,
          ordersToday: 847,
          cartAdditions: 1236,
          checkoutStarts: 523,
          lastUpdate: new Date().toISOString()
        },
        userActivity: {
          currentUsers: 2847,
          peakUsers: 4521,
          newUsers: 1236,
          returningUsers: 1611,
          usersByHour: [
            { hour: '00:00', users: 1245, sessions: 1456, revenue: 125000 },
            { hour: '01:00', users: 987, sessions: 1123, revenue: 98000 },
            { hour: '02:00', users: 823, sessions: 945, revenue: 87000 },
            { hour: '03:00', users: 756, sessions: 834, revenue: 76000 },
            { hour: '04:00', users: 678, sessions: 723, revenue: 68000 },
            { hour: '05:00', users: 845, sessions: 923, revenue: 89000 },
            { hour: '06:00', users: 1234, sessions: 1345, revenue: 134000 },
            { hour: '07:00', users: 1876, sessions: 2045, revenue: 189000 },
            { hour: '08:00', users: 2345, sessions: 2567, revenue: 245000 },
            { hour: '09:00', users: 2847, sessions: 3123, revenue: 298000 }
          ],
          topPages: [
            { path: '/', pageViews: 12547, uniqueViews: 8934, averageTime: 2.3, bounceRate: 28.5 },
            { path: '/products', pageViews: 8934, uniqueViews: 6782, averageTime: 4.1, bounceRate: 22.1 },
            { path: '/categories/electronics', pageViews: 6782, uniqueViews: 5234, averageTime: 3.8, bounceRate: 25.7 },
            { path: '/search', pageViews: 5234, uniqueViews: 4123, averageTime: 3.2, bounceRate: 31.2 },
            { path: '/product/:id', pageViews: 4567, uniqueViews: 3456, averageTime: 5.7, bounceRate: 18.9 }
          ],
          userJourney: [
            { step: 'Landing', users: 10000, conversionRate: 100, dropoffRate: 0 },
            { step: 'Product View', users: 6500, conversionRate: 65, dropoffRate: 35 },
            { step: 'Add to Cart', users: 2600, conversionRate: 40, dropoffRate: 60 },
            { step: 'Checkout', users: 1300, conversionRate: 50, dropoffRate: 50 },
            { step: 'Purchase', users: 845, conversionRate: 65, dropoffRate: 35 }
          ]
        },
        salesActivity: {
          realtimeSales: 2845000,
          orderVolume: 847,
          averageOrderValue: 3360,
          topSellingProducts: [
            { id: 'p1', name: 'Wireless Gaming Headset', sales: 45, revenue: 562500, quantity: 45 },
            { id: 'p2', name: 'Smartphone Case', sales: 89, revenue: 445000, quantity: 178 },
            { id: 'p3', name: 'Bluetooth Speaker', sales: 34, revenue: 340000, quantity: 34 },
            { id: 'p4', name: 'Gaming Mouse', sales: 67, revenue: 281400, quantity: 67 },
            { id: 'p5', name: 'Power Bank', sales: 123, revenue: 246000, quantity: 123 }
          ],
          salesByCategory: [
            { category: 'Electronics', sales: 1138000, percentage: 40.0, growth: 15.2 },
            { category: 'Fashion', sales: 854000, percentage: 30.0, growth: 12.8 },
            { category: 'Home & Kitchen', sales: 569000, percentage: 20.0, growth: 18.5 },
            { category: 'Sports', sales: 284000, percentage: 10.0, growth: 22.1 }
          ],
          recentOrders: [
            { id: 'ORD-001', customer: 'Ahmed R.', amount: 12500, location: 'Dhaka', timestamp: '2 min ago', items: 2 },
            { id: 'ORD-002', customer: 'Fatima K.', amount: 8900, location: 'Chittagong', timestamp: '3 min ago', items: 1 },
            { id: 'ORD-003', customer: 'Mohammad H.', amount: 15600, location: 'Sylhet', timestamp: '5 min ago', items: 3 },
            { id: 'ORD-004', customer: 'Rashida B.', amount: 4200, location: 'Rajshahi', timestamp: '7 min ago', items: 1 },
            { id: 'ORD-005', customer: 'Karim S.', amount: 9800, location: 'Khulna', timestamp: '9 min ago', items: 2 }
          ],
          conversionFunnel: [
            { step: 'Visits', users: 12847, conversionRate: 100 },
            { step: 'Product Views', users: 8356, conversionRate: 65.1 },
            { step: 'Cart Additions', users: 2510, conversionRate: 30.0 },
            { step: 'Checkout', users: 1255, conversionRate: 50.0 },
            { step: 'Purchase', users: 847, conversionRate: 67.5 }
          ]
        },
        trafficSources: [
          { source: 'Direct', users: 1139, percentage: 40.0, conversionRate: 4.2, revenue: 1138000, growth: 12.5 },
          { source: 'Google Search', users: 854, percentage: 30.0, conversionRate: 3.8, revenue: 854000, growth: 15.8 },
          { source: 'Facebook', users: 427, percentage: 15.0, conversionRate: 3.1, revenue: 427000, growth: 8.2 },
          { source: 'Instagram', users: 284, percentage: 10.0, conversionRate: 2.9, revenue: 284000, growth: 22.1 },
          { source: 'Others', users: 143, percentage: 5.0, conversionRate: 2.1, revenue: 142000, growth: 5.5 }
        ],
        deviceBreakdown: [
          { device: 'Mobile', users: 1707, percentage: 60.0, conversions: 381, revenue: 1707000 },
          { device: 'Desktop', users: 854, percentage: 30.0, conversions: 297, revenue: 854000 },
          { device: 'Tablet', users: 286, percentage: 10.0, conversions: 169, revenue: 284000 }
        ],
        geographicData: [
          { location: 'Dhaka', users: 1139, percentage: 40.0, revenue: 1138000, averageSessionDuration: 9.2 },
          { location: 'Chittagong', users: 569, percentage: 20.0, revenue: 569000, averageSessionDuration: 8.7 },
          { location: 'Sylhet', users: 342, percentage: 12.0, revenue: 342000, averageSessionDuration: 7.8 },
          { location: 'Rajshahi', users: 285, percentage: 10.0, revenue: 284000, averageSessionDuration: 8.1 },
          { location: 'Others', users: 512, percentage: 18.0, revenue: 512000, averageSessionDuration: 7.5 }
        ],
        recentEvents: [
          { id: 'e1', type: 'purchase', description: 'Gaming Headset purchased', timestamp: '30 seconds ago', value: 12500, location: 'Dhaka', device: 'Mobile' },
          { id: 'e2', type: 'cart_addition', description: 'Smartphone added to cart', timestamp: '45 seconds ago', location: 'Chittagong', device: 'Desktop' },
          { id: 'e3', type: 'signup', description: 'New user registration', timestamp: '1 minute ago', location: 'Sylhet', device: 'Mobile' },
          { id: 'e4', type: 'purchase', description: 'Fashion items purchased', timestamp: '2 minutes ago', value: 8900, location: 'Dhaka', device: 'Mobile' },
          { id: 'e5', type: 'search', description: 'Search for "gaming mouse"', timestamp: '3 minutes ago', location: 'Rajshahi', device: 'Desktop' }
        ],
        alerts: [
          {
            id: 'alert1',
            type: 'spike',
            severity: 'medium',
            metric: 'Active Users',
            message: 'User activity 25% above normal levels',
            currentValue: 2847,
            expectedValue: 2280,
            timestamp: '5 minutes ago'
          },
          {
            id: 'alert2',
            type: 'milestone',
            severity: 'low',
            metric: 'Daily Revenue',
            message: 'Reached ₹28 Lakh daily revenue milestone',
            currentValue: 2845000,
            expectedValue: 2800000,
            timestamp: '15 minutes ago'
          }
        ],
        performanceMetrics: {
          pageLoadTime: 1.2,
          serverResponseTime: 0.8,
          errorRate: 0.02,
          uptime: 99.98,
          throughput: 450,
          concurrent: 2847
        }
      };

      setTimeout(() => {
        setRealTimeData(mockData);
        setLoading(false);
      }, 500);
    };

    loadRealTimeData();

    // Real-time updates
    if (isLive) {
      const interval = setInterval(() => {
        setRealTimeData(prev => {
          if (!prev) return prev;
          
          // Simulate real-time updates
          const userVariation = Math.floor(Math.random() * 100 - 50);
          const revenueVariation = Math.floor(Math.random() * 50000 - 25000);
          
          return {
            ...prev,
            liveMetrics: {
              ...prev.liveMetrics,
              activeUsers: Math.max(1000, prev.liveMetrics.activeUsers + userVariation),
              revenueToday: Math.max(0, prev.liveMetrics.revenueToday + revenueVariation),
              pageViews: prev.liveMetrics.pageViews + Math.floor(Math.random() * 20),
              lastUpdate: new Date().toISOString()
            }
          };
        });
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [isLive, updateInterval]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Crore`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'signup': return <Users className="h-4 w-4 text-blue-500" />;
      case 'cart_addition': return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      case 'page_view': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'search': return <Globe className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Mobile': return <Smartphone className="h-4 w-4" />;
      case 'Desktop': return <Monitor className="h-4 w-4" />;
      case 'Tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!realTimeData) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Real-Time Analytics Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load real-time analytics data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-500" />
            Real-Time Analytics
          </h1>
          <p className="text-muted-foreground">
            Live monitoring of user activity, sales, and system performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={isLive ? 'bg-green-500' : 'bg-gray-500'}>
            <div className={cn('w-2 h-2 rounded-full mr-2', isLive ? 'bg-white animate-pulse' : 'bg-gray-300')}></div>
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value={1000}>1s updates</option>
            <option value={3000}>3s updates</option>
            <option value={5000}>5s updates</option>
            <option value={10000}>10s updates</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setIsLive(!isLive)}
            className={isLive ? 'border-green-500 text-green-600' : ''}
          >
            {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {realTimeData.liveMetrics.activeUsers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
            <div className="flex items-center justify-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              <span className="text-xs text-green-600">Live</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {realTimeData.liveMetrics.pageViews.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Page Views</div>
            <div className="text-xs text-blue-600 mt-1">Today</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(realTimeData.liveMetrics.revenueToday)}
            </div>
            <div className="text-sm text-muted-foreground">Revenue</div>
            <div className="text-xs text-purple-600 mt-1">Today</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {realTimeData.liveMetrics.ordersToday.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Orders</div>
            <div className="text-xs text-orange-600 mt-1">Today</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {realTimeData.liveMetrics.conversionRate}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion</div>
            <div className="text-xs text-yellow-600 mt-1">Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">
              {realTimeData.liveMetrics.averageSessionDuration}m
            </div>
            <div className="text-sm text-muted-foreground">Avg Session</div>
            <div className="text-xs text-pink-600 mt-1">Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {realTimeData.alerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Real-Time Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realTimeData.alerts.map((alert) => (
              <Card key={alert.id} className={cn(
                'border-l-4',
                alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                'border-blue-500 bg-blue-50'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{alert.metric}</h4>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {alert.currentValue.toLocaleString()}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'users', 'sales', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {realTimeData.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.timestamp}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          {event.device && (
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(event.device)}
                              {event.device}
                            </span>
                          )}
                        </div>
                      </div>
                      {event.value && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            ₹{event.value.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.trafficSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <div>
                          <h4 className="font-medium">{source.source}</h4>
                          <p className="text-sm text-muted-foreground">
                            {source.users.toLocaleString()} users • {source.conversionRate}% conversion
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(source.revenue)}</div>
                        <div className="text-sm text-green-600">+{source.growth}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.deviceBreakdown.map((device) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device)}
                          <span className="text-sm font-medium">{device.device}</span>
                        </div>
                        <span className="text-sm">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{device.users.toLocaleString()} users</span>
                        <span>{device.conversions} conversions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Data */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.geographicData.map((location) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{location.location}</h4>
                        <p className="text-sm text-muted-foreground">
                          {location.users.toLocaleString()} users
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(location.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {location.averageSessionDuration}m avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Page Load Time</span>
                    <span className="font-medium">{realTimeData.performanceMetrics.pageLoadTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Response</span>
                    <span className="font-medium">{realTimeData.performanceMetrics.serverResponseTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium">{realTimeData.performanceMetrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium text-green-600">{realTimeData.performanceMetrics.uptime}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Concurrent Users</span>
                    <span className="font-medium">{realTimeData.performanceMetrics.concurrent.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {realTimeData.userActivity.currentUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Current Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeData.userActivity.peakUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Peak Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeData.userActivity.newUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">New Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeData.userActivity.returningUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Returning</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.userActivity.topPages.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-primary">#{index + 1}</div>
                        <div>
                          <h4 className="font-medium text-sm">{page.path}</h4>
                          <p className="text-xs text-muted-foreground">
                            {page.averageTime}m avg • {page.bounceRate}% bounce
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{page.pageViews.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realTimeData.userActivity.userJourney.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{step.step}</h4>
                        <div className="text-right">
                          <div className="font-medium">{step.users.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{step.conversionRate}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${step.conversionRate}%` }}
                        ></div>
                      </div>
                      {index < realTimeData.userActivity.userJourney.length - 1 && (
                        <div className="text-xs text-red-500 mt-1">
                          -{step.dropoffRate}% dropoff
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(realTimeData.salesActivity.realtimeSales)}
                </div>
                <div className="text-sm text-muted-foreground">Sales Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeData.salesActivity.orderVolume.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{realTimeData.salesActivity.averageOrderValue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Avg Order Value</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.salesActivity.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                        <div className="text-xs text-muted-foreground">revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.salesActivity.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{order.customer}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{order.location}</span>
                          <span>{order.items} items</span>
                          <span>{order.timestamp}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          ₹{order.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realTimeData.salesActivity.conversionFunnel.map((step, index) => (
                  <div key={step.step} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{step.step}</h4>
                      <div className="text-right">
                        <div className="font-medium">{step.users.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{step.conversionRate}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                        style={{ width: `${step.conversionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeData.performanceMetrics.uptime}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeData.performanceMetrics.pageLoadTime}s
                </div>
                <div className="text-sm text-muted-foreground">Page Load</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeData.performanceMetrics.throughput}
                </div>
                <div className="text-sm text-muted-foreground">Requests/sec</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Page Load Time</span>
                      <span>{realTimeData.performanceMetrics.pageLoadTime}s</span>
                    </div>
                    <Progress value={Math.max(0, 100 - realTimeData.performanceMetrics.pageLoadTime * 50)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Server Response Time</span>
                      <span>{realTimeData.performanceMetrics.serverResponseTime}s</span>
                    </div>
                    <Progress value={Math.max(0, 100 - realTimeData.performanceMetrics.serverResponseTime * 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span>{realTimeData.performanceMetrics.errorRate}%</span>
                    </div>
                    <Progress value={Math.max(0, 100 - realTimeData.performanceMetrics.errorRate * 1000)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>System Uptime</span>
                      <span>{realTimeData.performanceMetrics.uptime}%</span>
                    </div>
                    <Progress value={realTimeData.performanceMetrics.uptime} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">API Server</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Cache Layer</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">CDN</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Optimized</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-sm text-muted-foreground mt-8">
        Last updated: {new Date(realTimeData.liveMetrics.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default RealTimeAnalytics;