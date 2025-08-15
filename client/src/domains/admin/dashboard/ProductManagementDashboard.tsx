/**
 * Product Management Dashboard - Amazon.com/Shopee.sg Level
 * Complete enterprise-grade product management interface
 * Advanced analytics, bulk operations, and AI insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Globe,
  Star,
  Heart,
  MessageSquare,
  Settings,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  vendor: string;
  price: number;
  inventory: number;
  status: 'active' | 'inactive' | 'draft';
  performance: {
    views: number;
    sales: number;
    revenue: number;
    rating: number;
    conversionRate: number;
  };
  aiInsights: {
    recommendedPrice: number;
    demandForecast: number;
    contentScore: number;
    competitionRank: number;
  };
  lastUpdated: Date;
}

interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalSales: number;
  avgRating: number;
  lowStockCount: number;
  topCategories: Array<{ name: string; count: number; revenue: number }>;
  recentActivity: Array<{ type: string; message: string; timestamp: Date }>;
}

export function ProductManagementDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [bulkOperation, setBulkOperation] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock API calls - replace with actual API
      const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
        const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
        const vendors = ['TechZone BD', 'Fashion Hub', 'HomeStyle', 'SportsPro', 'BookWorld'];
        const statuses: Product['status'][] = ['active', 'inactive', 'draft'];
        
        return {
          id: `product_${i + 1}`,
          name: `Product ${i + 1} - Premium Quality Item`,
          sku: `SKU-${1000 + i}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          vendor: vendors[Math.floor(Math.random() * vendors.length)],
          price: Math.round((Math.random() * 50000 + 500) * 100) / 100,
          inventory: Math.floor(Math.random() * 200),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          performance: {
            views: Math.floor(Math.random() * 10000),
            sales: Math.floor(Math.random() * 500),
            revenue: Math.round((Math.random() * 100000 + 1000) * 100) / 100,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
            conversionRate: Math.round((Math.random() * 5 + 1) * 100) / 100
          },
          aiInsights: {
            recommendedPrice: Math.round((Math.random() * 60000 + 400) * 100) / 100,
            demandForecast: Math.floor(Math.random() * 100 + 50),
            contentScore: Math.floor(Math.random() * 30 + 70),
            competitionRank: Math.floor(Math.random() * 10 + 1)
          },
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
      });

      const mockMetrics: DashboardMetrics = {
        totalProducts: mockProducts.length,
        activeProducts: mockProducts.filter(p => p.status === 'active').length,
        totalRevenue: mockProducts.reduce((sum, p) => sum + p.performance.revenue, 0),
        totalSales: mockProducts.reduce((sum, p) => sum + p.performance.sales, 0),
        avgRating: mockProducts.reduce((sum, p) => sum + p.performance.rating, 0) / mockProducts.length,
        lowStockCount: mockProducts.filter(p => p.inventory < 10).length,
        topCategories: [
          { name: 'Electronics', count: 15, revenue: 125000 },
          { name: 'Clothing', count: 12, revenue: 89000 },
          { name: 'Home & Garden', count: 8, revenue: 67000 }
        ],
        recentActivity: [
          { type: 'product_created', message: 'New product "Smartphone X" added', timestamp: new Date() },
          { type: 'price_updated', message: 'AI recommended price update for 5 products', timestamp: new Date() },
          { type: 'inventory_alert', message: '3 products running low on stock', timestamp: new Date() }
        ]
      };

      setProducts(mockProducts);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedProducts.length === 0) return;

    try {
      setLoading(true);
      
      // Mock bulk operation
      console.log(`Performing ${bulkOperation} on ${selectedProducts.length} products`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset selection
      setSelectedProducts([]);
      setBulkOperation('');
      
      // Reload data
      await loadDashboardData();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPerformanceIcon = (value: number, threshold: number) => {
    return value >= threshold ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin mr-3" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog with AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeProducts} active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Across all products
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {metrics?.lowStockCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{metrics.lowStockCount} products</strong> are running low on stock. 
            <Button variant="link" className="p-0 h-auto ml-2">View Details</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Best performing product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.count} products
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(category.revenue)}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest product management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'product_created' && <Plus className="h-4 w-4 text-green-500" />}
                        {activity.type === 'price_updated' && <DollarSign className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'inventory_alert' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {/* Product Management Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Operations */}
                {selectedProducts.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedProducts.length} selected
                    </span>
                    <Select value={bulkOperation} onValueChange={setBulkOperation}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Bulk Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">Activate</SelectItem>
                        <SelectItem value="deactivate">Deactivate</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                        <SelectItem value="update_price">Update Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkOperation} disabled={!bulkOperation || loading}>
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={selectAllProducts}
                        />
                      </th>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">Inventory</th>
                      <th className="text-left p-4">Performance</th>
                      <th className="text-left p-4">AI Score</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku} • {product.category}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(product.status)} text-white`}
                          >
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{formatCurrency(product.price)}</div>
                            {product.aiInsights.recommendedPrice !== product.price && (
                              <div className="text-sm text-blue-600">
                                AI: {formatCurrency(product.aiInsights.recommendedPrice)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={product.inventory < 10 ? 'text-red-600' : ''}>
                              {product.inventory}
                            </span>
                            {product.inventory < 10 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-3 w-3" />
                              <span className="text-sm">{product.performance.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ShoppingCart className="h-3 w-3" />
                              <span className="text-sm">{product.performance.sales}</span>
                              {getPerformanceIcon(product.performance.conversionRate, 3)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm font-medium">{product.aiInsights.contentScore}/100</div>
                              <div className="text-xs text-muted-foreground">
                                Rank #{product.aiInsights.competitionRank}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Product revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mr-3" />
                  <span>Revenue chart would be rendered here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mr-3" />
                  <span>Category chart would be rendered here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Price Optimization
                </CardTitle>
                <CardDescription>AI-powered pricing recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Products with price updates</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential revenue increase</span>
                    <span className="text-green-600">+15.3%</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Apply AI Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Content Optimization
                </CardTitle>
                <CardDescription>AI-generated content improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Content score avg</span>
                    <span>82/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products to optimize</span>
                    <Badge>8</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Demand Forecasting
                </CardTitle>
                <CardDescription>Predictive demand analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>High demand products</span>
                    <Badge>15</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Restock recommendations</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Forecast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>Configure automatic product management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Auto-price updates</p>
                      <p className="text-sm text-muted-foreground">Update prices based on AI recommendations</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Inventory alerts</p>
                      <p className="text-sm text-muted-foreground">Alert when stock runs low</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Content generation</p>
                      <p className="text-sm text-muted-foreground">Auto-generate product descriptions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Templates</CardTitle>
                <CardDescription>Pre-built automation workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  New Product Launch Workflow
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Dynamic Pricing Workflow
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Low Stock Management
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Review Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}