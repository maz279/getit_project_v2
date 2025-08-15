/**
 * Real-Time Metrics Dashboard - Amazon.com/Shopee.sg-Level Analytics
 * 
 * Complete real-time analytics dashboard featuring:
 * - Live sales monitoring
 * - Real-time user activity tracking
 * - Payment gateway performance
 * - Vendor performance metrics
 * - Bangladesh market insights
 * - WebSocket-based live updates
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Globe,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Smartphone,
  CreditCard,
  Package,
  Star,
  MapPin
} from 'lucide-react';

// Real-time data types
interface RealtimeMetrics {
  sales: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  activeUsers: {
    total: number;
    mobile: number;
    desktop: number;
    locations: Array<{ division: string; count: number }>;
  };
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    total: number;
  };
  payments: {
    bkash: { count: number; amount: number; success_rate: number };
    nagad: { count: number; amount: number; success_rate: number };
    rocket: { count: number; amount: number; success_rate: number };
    card: { count: number; amount: number; success_rate: number };
    cod: { count: number; amount: number; success_rate: number };
  };
  vendors: {
    online: number;
    total: number;
    topPerformers: Array<{ name: string; sales: number; rating: number }>;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
    totalProducts: number;
  };
}

// Mock WebSocket simulation for real-time updates
const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // Simulate connection delay
      setTimeout(() => {
        setConnectionStatus('connected');
        
        // Generate initial data
        setMetrics(generateMockMetrics());
        
        // Set up periodic updates (simulating WebSocket messages)
        intervalRef.current = setInterval(() => {
          setMetrics(generateMockMetrics());
        }, 2000); // Update every 2 seconds
      }, 1000);
    };

    connectWebSocket();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { metrics, connectionStatus };
};

// Generate mock real-time data (would be replaced with actual WebSocket data)
const generateMockMetrics = (): RealtimeMetrics => {
  const base = Date.now() % 1000;
  
  return {
    sales: {
      current: 125000 + (base * 100),
      previous: 118000,
      percentage: 5.9,
      trend: 'up'
    },
    activeUsers: {
      total: 1245 + Math.floor(Math.random() * 100),
      mobile: 890 + Math.floor(Math.random() * 50),
      desktop: 355 + Math.floor(Math.random() * 50),
      locations: [
        { division: 'Dhaka', count: 450 + Math.floor(Math.random() * 50) },
        { division: 'Chittagong', count: 280 + Math.floor(Math.random() * 30) },
        { division: 'Sylhet', count: 180 + Math.floor(Math.random() * 20) },
        { division: 'Rajshahi', count: 150 + Math.floor(Math.random() * 20) },
        { division: 'Khulna', count: 120 + Math.floor(Math.random() * 15) }
      ]
    },
    orders: {
      pending: 45 + Math.floor(Math.random() * 10),
      processing: 128 + Math.floor(Math.random() * 20),
      shipped: 89 + Math.floor(Math.random() * 15),
      delivered: 234 + Math.floor(Math.random() * 25),
      total: 496 + Math.floor(Math.random() * 50)
    },
    payments: {
      bkash: { count: 145, amount: 45600, success_rate: 98.5 },
      nagad: { count: 89, amount: 28900, success_rate: 97.8 },
      rocket: { count: 67, amount: 21400, success_rate: 96.9 },
      card: { count: 34, amount: 15600, success_rate: 99.2 },
      cod: { count: 78, amount: 18900, success_rate: 92.1 }
    },
    vendors: {
      online: 145 + Math.floor(Math.random() * 20),
      total: 234,
      topPerformers: [
        { name: 'TechHub BD', sales: 25600, rating: 4.8 },
        { name: 'Fashion World', sales: 18900, rating: 4.7 },
        { name: 'Book Corner', sales: 15400, rating: 4.9 }
      ]
    },
    inventory: {
      lowStock: 23,
      outOfStock: 8,
      totalProducts: 12450
    }
  };
};

const RealtimeMetrics: React.FC = () => {
  const { metrics, connectionStatus } = useRealtimeMetrics();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (metrics) {
      setLastUpdate(new Date());
    }
  }, [metrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-pulse" />
          <span>Connecting to real-time data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">Live platform metrics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Live Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.sales.current)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.sales.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              +{metrics.sales.percentage}% from yesterday
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.total.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Smartphone className="w-3 h-3" />
              <span>{metrics.activeUsers.mobile}</span>
              <span>•</span>
              <span>{metrics.activeUsers.desktop} desktop</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.orders.total}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.orders.pending} pending • {metrics.orders.processing} processing
            </div>
          </CardContent>
        </Card>

        {/* Online Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Vendors</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vendors.online}</div>
            <div className="text-xs text-muted-foreground">
              of {metrics.vendors.total} total vendors
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bangladesh Payment Methods Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Methods Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.payments).map(([method, data]) => (
                <div key={method} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant={method === 'bkash' ? 'default' : 'secondary'} className="capitalize">
                        {method === 'bkash' ? 'bKash' : 
                         method === 'cod' ? 'COD' : 
                         method.charAt(0).toUpperCase() + method.slice(1)}
                      </Badge>
                      <span className="text-sm">{data.count} transactions</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(data.amount)}</div>
                      <div className="text-xs text-muted-foreground">{data.success_rate}% success</div>
                    </div>
                  </div>
                  <Progress value={data.success_rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              User Distribution by Division
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.activeUsers.locations.map((location, index) => (
                <div key={location.division} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{location.division}</span>
                    <span className="text-sm text-muted-foreground">{location.count} users</span>
                  </div>
                  <Progress 
                    value={(location.count / metrics.activeUsers.total) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status and Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.orders.pending}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.orders.processing}</div>
                  <div className="text-sm text-blue-600">Processing</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metrics.orders.shipped}</div>
                  <div className="text-sm text-purple-600">Shipped</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.orders.delivered}</div>
                  <div className="text-sm text-green-600">Delivered</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Top Performing Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.vendors.topPerformers.map((vendor, index) => (
                <div key={vendor.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {vendor.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(vendor.sales)}</div>
                    <div className="text-xs text-muted-foreground">today</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <div className="text-lg font-bold text-red-600">{metrics.inventory.outOfStock}</div>
                <div className="text-sm text-red-600">Out of Stock</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <div className="text-lg font-bold text-yellow-600">{metrics.inventory.lowStock}</div>
                <div className="text-sm text-yellow-600">Low Stock</div>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <div className="text-lg font-bold text-green-600">{metrics.inventory.totalProducts.toLocaleString()}</div>
                <div className="text-sm text-green-600">Total Products</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeMetrics;