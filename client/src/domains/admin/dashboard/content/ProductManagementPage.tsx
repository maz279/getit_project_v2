/**
 * Product Management Dashboard Page
 * Advanced Product Operations with Rich Visual Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Progress } from '@/shared/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Package, TrendingUp, TrendingDown, Eye, Edit, Star, ShoppingCart, AlertTriangle, DollarSign, BarChart3, Filter, Plus, Download, Search } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProductData {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  comparePrice: number;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  featured: boolean;
  createdAt: string;
  image: string;
}

interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalRevenue: number;
  averageRating: number;
}

export function ProductManagementPage() {
  const [metrics, setMetrics] = useState<ProductMetrics>({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive product data
      const mockMetrics: ProductMetrics = {
        totalProducts: 15847,
        activeProducts: 14256,
        outOfStock: 892,
        lowStock: 699,
        totalRevenue: 47285640,
        averageRating: 4.3
      };

      const mockProducts: ProductData[] = [
        {
          id: 'P001',
          name: 'Samsung Galaxy S24 Ultra 256GB',
          category: 'Electronics',
          vendor: 'TechWorld BD',
          price: 135000,
          comparePrice: 145000,
          stock: 45,
          sold: 234,
          rating: 4.8,
          reviews: 89,
          status: 'active',
          featured: true,
          createdAt: '2024-01-15',
          image: '/api/placeholder/100/100'
        },
        {
          id: 'P002',
          name: 'Apple iPhone 15 Pro 128GB',
          category: 'Electronics',
          vendor: 'iStore Bangladesh',
          price: 142000,
          comparePrice: 150000,
          stock: 12,
          sold: 156,
          rating: 4.9,
          reviews: 67,
          status: 'active',
          featured: true,
          createdAt: '2024-02-10',
          image: '/api/placeholder/100/100'
        },
        {
          id: 'P003',
          name: 'Nike Air Max 270 Black',
          category: 'Fashion',
          vendor: 'SportZone BD',
          price: 8500,
          comparePrice: 9500,
          stock: 0,
          sold: 78,
          rating: 4.4,
          reviews: 34,
          status: 'out_of_stock',
          featured: false,
          createdAt: '2024-03-05',
          image: '/api/placeholder/100/100'
        }
      ];

      setMetrics(mockMetrics);
      setProducts(mockProducts);
      
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category.toLowerCase() === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case 'discontinued':
        return <Badge className="bg-yellow-100 text-yellow-800">Discontinued</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const categoryPerformanceData = [
    { category: 'Electronics', revenue: 18500000, products: 2456, avgRating: 4.5 },
    { category: 'Fashion', revenue: 12300000, products: 5847, avgRating: 4.2 },
    { category: 'Home & Garden', revenue: 8900000, products: 3456, avgRating: 4.3 },
    { category: 'Books', revenue: 4200000, products: 2156, avgRating: 4.7 },
    { category: 'Health & Beauty', revenue: 3200000, products: 1932, avgRating: 4.1 }
  ];

  const salesTrendData = [
    { month: 'Jan', revenue: 3800000, orders: 1250, products: 14200 },
    { month: 'Feb', revenue: 4200000, orders: 1380, products: 14500 },
    { month: 'Mar', revenue: 3900000, orders: 1290, products: 14800 },
    { month: 'Apr', revenue: 4600000, orders: 1520, products: 15100 },
    { month: 'May', revenue: 5100000, orders: 1680, products: 15400 },
    { month: 'Jun', revenue: 5400000, orders: 1780, products: 15847 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Comprehensive product catalog operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Catalog
          </Button>
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="Enter product name" />
                </div>
                <div>
                  <Label htmlFor="product-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product-price">Price (BDT)</Label>
                  <Input id="product-price" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="product-compare-price">Compare Price (BDT)</Label>
                  <Input id="product-compare-price" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="product-stock">Stock Quantity</Label>
                  <Input id="product-stock" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="product-vendor">Vendor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techworld">TechWorld BD</SelectItem>
                      <SelectItem value="istore">iStore Bangladesh</SelectItem>
                      <SelectItem value="sportzone">SportZone BD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea id="product-description" placeholder="Product description..." />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch id="featured" />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="col-span-2">
                  <Button className="w-full">Create Product</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeProducts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="orders" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" />
                <Bar dataKey="products" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Catalog</span>
            <div className="flex space-x-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded" />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                        {product.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                      {product.comparePrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.comparePrice)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock}
                    </div>
                  </TableCell>
                  <TableCell>{product.sold}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {product.rating} ({product.reviews})
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductManagementPage;