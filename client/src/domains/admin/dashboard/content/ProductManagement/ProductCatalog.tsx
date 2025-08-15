/**
 * ProductCatalog - Comprehensive Product Management Dashboard
 * Amazon.com/Shopee.sg-Level Product Catalog with Bangladesh Market Focus
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  Search, Filter, Download, RefreshCw, Eye, Edit, Plus, Upload,
  Package, Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  BarChart3, Activity, Tag, DollarSign, ShoppingBag, Camera, FileText
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Product status definitions
const productStatuses = {
  active: { label: 'Active', count: 2847, color: 'bg-green-100 text-green-800', growth: 8.5 },
  pending: { label: 'Pending Review', count: 89, color: 'bg-yellow-100 text-yellow-800', growth: 15.2 },
  draft: { label: 'Draft', count: 156, color: 'bg-blue-100 text-blue-800', growth: -5.3 },
  inactive: { label: 'Inactive', count: 234, color: 'bg-gray-100 text-gray-800', growth: -12.8 },
  rejected: { label: 'Rejected', count: 45, color: 'bg-red-100 text-red-800', growth: 3.2 },
  outOfStock: { label: 'Out of Stock', count: 178, color: 'bg-orange-100 text-orange-800', growth: -8.9 }
};

// Sample Bangladesh market products
const sampleProducts = [
  {
    id: 'PROD-2024-001',
    name: 'Samsung Galaxy A54 5G',
    nameInBengali: 'স্যামসাং গ্যালাক্সি এ৫৪ ৫জি',
    sku: 'SAM-A54-5G-128',
    category: 'Electronics > Smartphones',
    vendor: 'TechHub Bangladesh',
    images: ['/api/placeholder/100/100'],
    price: 45000,
    comparePrice: 52000,
    inventory: 234,
    lowStockThreshold: 50,
    status: 'active',
    visibility: 'published',
    featured: true,
    rating: 4.8,
    reviews: 156,
    sales: 89,
    views: 2340,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-03'),
    tags: ['smartphone', 'android', 'samsung', '5g'],
    seoTitle: 'Samsung Galaxy A54 5G Price in Bangladesh',
    description: 'Latest Samsung Galaxy A54 with 5G connectivity, 128GB storage, and premium camera system.',
    shipping: {
      weight: 0.2,
      dimensions: { length: 15, width: 7, height: 1 },
      freeShipping: true
    },
    analytics: {
      conversionRate: 4.2,
      addToCartRate: 12.8,
      bounceRate: 35.6,
      avgTimeOnPage: 125
    }
  },
  {
    id: 'PROD-2024-002',
    name: 'Traditional Banarasi Saree',
    nameInBengali: 'ঐতিহ্যবাহী বেনারসি শাড়ি',
    sku: 'BAN-SAREE-RED-001',
    category: 'Fashion > Women > Sarees',
    vendor: 'Bengal Boutique',
    images: ['/api/placeholder/100/100'],
    price: 8500,
    comparePrice: 12000,
    inventory: 45,
    lowStockThreshold: 20,
    status: 'active',
    visibility: 'published',
    featured: true,
    rating: 4.9,
    reviews: 89,
    sales: 67,
    views: 1890,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-07-02'),
    tags: ['saree', 'traditional', 'banarasi', 'women', 'wedding'],
    seoTitle: 'Authentic Banarasi Saree Price in Bangladesh',
    description: 'Handwoven authentic Banarasi saree with intricate zari work, perfect for weddings and special occasions.',
    shipping: {
      weight: 0.8,
      dimensions: { length: 30, width: 25, height: 5 },
      freeShipping: false
    },
    analytics: {
      conversionRate: 6.8,
      addToCartRate: 18.5,
      bounceRate: 28.9,
      avgTimeOnPage: 185
    }
  },
  {
    id: 'PROD-2024-003',
    name: 'Instant Pot Electric Pressure Cooker',
    nameInBengali: 'ইনস্ট্যান্ট পট ইলেকট্রিক প্রেশার কুকার',
    sku: 'IP-PRESS-6QT-001',
    category: 'Home & Kitchen > Appliances',
    vendor: 'Kitchen World BD',
    images: ['/api/placeholder/100/100'],
    price: 15500,
    comparePrice: 18000,
    inventory: 89,
    lowStockThreshold: 30,
    status: 'active',
    visibility: 'published',
    featured: false,
    rating: 4.7,
    reviews: 234,
    sales: 156,
    views: 3456,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-07-01'),
    tags: ['kitchen', 'pressure-cooker', 'appliance', 'instant-pot'],
    seoTitle: 'Instant Pot Electric Pressure Cooker Price in Bangladesh',
    description: '6-quart multi-use electric pressure cooker with 7-in-1 functionality for modern kitchens.',
    shipping: {
      weight: 5.2,
      dimensions: { length: 35, width: 32, height: 25 },
      freeShipping: true
    },
    analytics: {
      conversionRate: 5.4,
      addToCartRate: 15.2,
      bounceRate: 42.1,
      avgTimeOnPage: 98
    }
  },
  {
    id: 'PROD-2024-004',
    name: 'Nike Air Max Running Shoes',
    nameInBengali: 'নাইকি এয়ার ম্যাক্স রানিং জুতা',
    sku: 'NIKE-AM-90-BLK-42',
    category: 'Sports > Footwear > Running',
    vendor: 'Sports Arena BD',
    images: ['/api/placeholder/100/100'],
    price: 12500,
    comparePrice: 14500,
    inventory: 23,
    lowStockThreshold: 25,
    status: 'active',
    visibility: 'published',
    featured: false,
    rating: 4.6,
    reviews: 67,
    sales: 45,
    views: 1567,
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-06-30'),
    tags: ['nike', 'running', 'shoes', 'sports', 'air-max'],
    seoTitle: 'Nike Air Max Running Shoes Price in Bangladesh',
    description: 'Authentic Nike Air Max running shoes with premium cushioning and breathable design.',
    shipping: {
      weight: 1.2,
      dimensions: { length: 32, width: 20, height: 12 },
      freeShipping: false
    },
    analytics: {
      conversionRate: 3.8,
      addToCartRate: 11.4,
      bounceRate: 48.7,
      avgTimeOnPage: 76
    }
  },
  {
    id: 'PROD-2024-005',
    name: 'Premium Hilsha Fish (1kg)',
    nameInBengali: 'প্রিমিয়াম ইলিশ মাছ (১ কেজি)',
    sku: 'FISH-HILSHA-1KG-001',
    category: 'Food & Grocery > Fresh Fish',
    vendor: 'Fresh Fish Market',
    images: ['/api/placeholder/100/100'],
    price: 2800,
    comparePrice: 3200,
    inventory: 12,
    lowStockThreshold: 15,
    status: 'pending',
    visibility: 'hidden',
    featured: false,
    rating: 4.9,
    reviews: 23,
    sales: 34,
    views: 567,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-04'),
    tags: ['fish', 'hilsha', 'fresh', 'grocery', 'bengali'],
    seoTitle: 'Fresh Hilsha Fish Price in Bangladesh',
    description: 'Premium quality fresh Hilsha fish, sourced directly from Padma river fishermen.',
    shipping: {
      weight: 1.0,
      dimensions: { length: 25, width: 15, height: 8 },
      freeShipping: false,
      perishable: true
    },
    analytics: {
      conversionRate: 8.9,
      addToCartRate: 25.6,
      bounceRate: 15.2,
      avgTimeOnPage: 234
    }
  }
];

// Product categories with Bangladesh market focus
const productCategories = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    nameInBengali: 'ইলেকট্রনিক্স',
    count: 892, 
    growth: 12.5,
    subcategories: ['Smartphones', 'Laptops', 'Accessories', 'Home Electronics'],
    performance: { sales: 15600000, orders: 3456 }
  },
  { 
    id: 'fashion', 
    name: 'Fashion & Beauty', 
    nameInBengali: 'ফ্যাশন ও সৌন্দর্য',
    count: 1456, 
    growth: 18.7,
    subcategories: ['Mens Clothing', 'Womens Clothing', 'Accessories', 'Beauty Products'],
    performance: { sales: 12800000, orders: 2890 }
  },
  { 
    id: 'home', 
    name: 'Home & Kitchen', 
    nameInBengali: 'ঘর ও রান্নাঘর',
    count: 567, 
    growth: 8.3,
    subcategories: ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Storage'],
    performance: { sales: 8900000, orders: 1567 }
  },
  { 
    id: 'grocery', 
    name: 'Food & Grocery', 
    nameInBengali: 'খাদ্য ও মুদি',
    count: 2341, 
    growth: 25.6,
    subcategories: ['Fresh Produce', 'Packaged Foods', 'Beverages', 'Spices'],
    performance: { sales: 6700000, orders: 4567 }
  },
  { 
    id: 'sports', 
    name: 'Sports & Outdoor', 
    nameInBengali: 'খেলাধুলা ও বহিরঙ্গন',
    count: 345, 
    growth: 14.2,
    subcategories: ['Sports Equipment', 'Fitness', 'Outdoor Gear', 'Team Sports'],
    performance: { sales: 4500000, orders: 987 }
  }
];

// Inventory analytics
const inventoryAnalytics = {
  overview: {
    totalProducts: 3549,
    activeProducts: 2847,
    lowStockItems: 178,
    outOfStockItems: 89,
    totalValue: 45600000,
    averagePrice: 3456
  },
  lowStockAlerts: [
    { product: 'iPhone 15 Pro', sku: 'APL-IP15P-256', current: 8, threshold: 15, priority: 'high' },
    { product: 'Nike Air Jordan', sku: 'NIKE-AJ-1-42', current: 12, threshold: 20, priority: 'medium' },
    { product: 'Premium Tea Set', sku: 'TEA-SET-001', current: 18, threshold: 25, priority: 'low' },
    { product: 'Wooden Dining Table', sku: 'FURN-DT-6S', current: 3, threshold: 10, priority: 'high' }
  ],
  categoryPerformance: [
    { category: 'Electronics', turnover: 4.2, margin: 18.5, growth: 12.5 },
    { category: 'Fashion', turnover: 6.8, margin: 24.7, growth: 18.7 },
    { category: 'Home & Kitchen', turnover: 3.1, margin: 15.2, growth: 8.3 },
    { category: 'Sports', turnover: 5.4, margin: 21.3, growth: 14.2 }
  ]
};

// Product analytics data
const productAnalytics = {
  bestSellers: [
    { name: 'Samsung Galaxy A54', sales: 234, revenue: 10530000, rank: 1 },
    { name: 'Traditional Kurta Set', sales: 189, revenue: 5670000, rank: 2 },
    { name: 'Pressure Cooker 5L', sales: 156, revenue: 4680000, rank: 3 },
    { name: 'Premium Tea', sales: 145, revenue: 2175000, rank: 4 },
    { name: 'Gaming Mouse', sales: 134, revenue: 2010000, rank: 5 }
  ],
  trending: [
    { name: 'Eid Collection Dresses', growth: 145.6, views: 12340 },
    { name: 'Smart Watches', growth: 89.7, views: 8950 },
    { name: 'Home Workout Equipment', growth: 67.3, views: 6780 },
    { name: 'Organic Spices', growth: 56.8, views: 4560 }
  ],
  performance: [
    { metric: 'Conversion Rate', value: 4.8, change: 0.3, trend: 'up' },
    { metric: 'Add to Cart Rate', value: 15.6, change: -0.8, trend: 'down' },
    { metric: 'Page Views', value: 125000, change: 8900, trend: 'up' },
    { metric: 'Bounce Rate', value: 35.2, change: -2.1, trend: 'down' }
  ]
};

export function ProductCatalog() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterCategory, setFilterCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = productStatuses[status as keyof typeof productStatuses];
    return (
      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredProducts = sampleProducts.filter(product => {
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameInBengali.includes(searchQuery) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesStatus && matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on products:`, selectedProducts);
    setSelectedProducts([]);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length 
        ? []
        : filteredProducts.map(product => product.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive product catalog management with Bangladesh market optimization</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Product Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(productStatuses).map(([status, info]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === status ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(info.count)}</div>
              <div className={`text-xs font-medium mt-1 ${info.color.split(' ')[1]}`}>
                {info.label}
              </div>
              <div className={`text-xs mt-1 ${info.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {info.growth > 0 ? '+' : ''}{info.growth}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* Product Catalog Tab */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, SKU, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="sales">Best Selling</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="inventory">Stock Level</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Kitchen</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedProducts.length} product(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('publish')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')}>
                      <Star className="h-4 w-4 mr-2" />
                      Feature
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products ({formatNumber(filteredProducts.length)})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={selectAllProducts}
                  />
                  <span className="text-sm text-gray-500">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Checkbox 
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        
                        <Avatar className="h-16 w-16 rounded-lg">
                          <AvatarImage src={product.images[0]} alt={product.name} />
                          <AvatarFallback className="rounded-lg">
                            <Package className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          {/* Product Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                {product.featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                                {getStatusBadge(product.status)}
                              </div>
                              <p className="text-sm text-gray-600">{product.nameInBengali}</p>
                              <p className="text-sm text-gray-500">{product.sku} • {product.category}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(product.price)}</div>
                              {product.comparePrice > product.price && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatCurrency(product.comparePrice)}
                                </div>
                              )}
                              <div className="text-sm text-green-600">
                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
                              </div>
                            </div>
                          </div>

                          {/* Product Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Stock</div>
                                <div className={`${product.inventory <= product.lowStockThreshold ? 'text-red-600' : 'text-gray-500'}`}>
                                  {formatNumber(product.inventory)} units
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Rating</div>
                                <div className="text-gray-500">{product.rating} ({formatNumber(product.reviews)})</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <ShoppingBag className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Sales</div>
                                <div className="text-gray-500">{formatNumber(product.sales)} sold</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Views</div>
                                <div className="text-gray-500">{formatNumber(product.views)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Conversion</div>
                                <div className="text-gray-500">{product.analytics.conversionRate}%</div>
                              </div>
                            </div>
                          </div>

                          {/* Product Tags */}
                          <div className="flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {product.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Vendor & Update Info */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Vendor: {product.vendor}</span>
                            <span>Updated: {formatDistanceToNow(product.updatedAt)} ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Product Details: {product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Product Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Name: {product.name}</div>
                                    <div>Bengali Name: {product.nameInBengali}</div>
                                    <div>SKU: {product.sku}</div>
                                    <div>Category: {product.category}</div>
                                    <div>Vendor: {product.vendor}</div>
                                    <div>Status: {product.status}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Pricing & Inventory</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Price: {formatCurrency(product.price)}</div>
                                    <div>Compare Price: {formatCurrency(product.comparePrice)}</div>
                                    <div>Stock: {formatNumber(product.inventory)} units</div>
                                    <div>Low Stock Alert: {product.lowStockThreshold} units</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Performance Analytics</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Rating: {product.rating}/5 ({formatNumber(product.reviews)} reviews)</div>
                                    <div>Sales: {formatNumber(product.sales)} units sold</div>
                                    <div>Views: {formatNumber(product.views)}</div>
                                    <div>Conversion Rate: {product.analytics.conversionRate}%</div>
                                    <div>Add to Cart Rate: {product.analytics.addToCartRate}%</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Shipping Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Weight: {product.shipping.weight} kg</div>
                                    <div>Dimensions: {product.shipping.dimensions.length} × {product.shipping.dimensions.width} × {product.shipping.dimensions.height} cm</div>
                                    <div>Free Shipping: {product.shipping.freeShipping ? 'Yes' : 'No'}</div>
                                    {product.shipping.perishable && <div>Perishable: Yes</div>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.nameInBengali}</div>
                          <div className="text-sm text-gray-500">{formatNumber(category.count)} products</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(category.performance.sales)}</div>
                        <div className="text-sm text-gray-500">{formatNumber(category.performance.orders)} orders</div>
                        <div className={`text-sm ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth > 0 ? '+' : ''}{category.growth}% growth
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategories.map(cat => ({ name: cat.name, value: cat.count }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(inventoryAnalytics.overview.totalProducts)}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(inventoryAnalytics.overview.activeProducts)}</div>
                <div className="text-sm text-gray-600">Active Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{formatNumber(inventoryAnalytics.overview.lowStockItems)}</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{formatNumber(inventoryAnalytics.overview.outOfStockItems)}</div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(inventoryAnalytics.overview.totalValue)}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{formatCurrency(inventoryAnalytics.overview.averagePrice)}</div>
                <div className="text-sm text-gray-600">Avg Price</div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryAnalytics.lowStockAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{alert.product}</div>
                      <div className="text-sm text-gray-500">{alert.sku}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Current</div>
                        <div className="font-bold text-red-600">{alert.current}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Threshold</div>
                        <div className="font-bold">{alert.threshold}</div>
                      </div>
                      {getPriorityBadge(alert.priority)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <Card>
              <CardHeader>
                <CardTitle>Best Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productAnalytics.bestSellers.map((product) => (
                    <div key={product.rank} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{product.rank}</span>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{formatNumber(product.sales)} units sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(product.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Products */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productAnalytics.trending.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{formatNumber(product.views)} views</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-bold">+{product.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {productAnalytics.performance.map((metric) => (
                  <div key={metric.metric} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{
                      typeof metric.value === 'number' && metric.value > 1000 
                        ? formatNumber(metric.value)
                        : metric.value
                    }{metric.metric.includes('Rate') ? '%' : ''}</div>
                    <div className="text-sm text-gray-600 mt-1">{metric.metric}</div>
                    <div className={`text-xs mt-1 flex items-center justify-center ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {metric.change > 0 ? '+' : ''}{metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  Pending Approvals ({productStatuses.pending.count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProducts.filter(p => p.status === 'pending').map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage src={product.images[0]} alt={product.name} />
                          <AvatarFallback className="rounded-lg">
                            <Package className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.vendor}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Control Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Control Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Review Score</span>
                    <span className="font-bold">4.7/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Products with Images</span>
                    <span className="font-bold">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Complete Descriptions</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SEO Optimized</span>
                    <span className="font-bold">87.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rejection Rate</span>
                    <span className="font-bold text-red-600">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProductCatalog;