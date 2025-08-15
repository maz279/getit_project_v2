import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Archive,
  RefreshCw
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    value: string;
    price: number;
    comparePrice: number;
    inventory: number;
    sku: string;
  }>;
  basePrice: number;
  comparePrice: number;
  costPrice: number;
  inventory: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isDigital: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  basePrice: number;
  comparePrice: number;
  costPrice: number;
  inventory: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isDigital: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

const VendorProductManager: React.FC = () => {
  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('updated');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    basePrice: 0,
    comparePrice: 0,
    costPrice: 0,
    inventory: 0,
    lowStockThreshold: 5,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    isActive: true,
    isDigital: false,
    tags: [],
    seoTitle: '',
    seoDescription: ''
  });

  const categories = [
    { id: 'electronics', name: 'Electronics', subcategories: ['Smartphones', 'Laptops', 'Audio', 'Cameras'] },
    { id: 'fashion', name: 'Fashion & Beauty', subcategories: ['Clothing', 'Shoes', 'Accessories', 'Beauty'] },
    { id: 'home', name: 'Home & Living', subcategories: ['Furniture', 'Kitchen', 'Decor', 'Appliances'] },
    { id: 'sports', name: 'Sports & Outdoors', subcategories: ['Sports Equipment', 'Fitness', 'Outdoor Gear'] }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Samsung Galaxy A54 5G 128GB',
          description: 'Experience the power of Samsung Galaxy A54 5G with its advanced camera system and long-lasting battery.',
          category: 'electronics',
          subcategory: 'Smartphones',
          brand: 'Samsung',
          sku: 'SAM-A54-128-BK',
          images: ['/placeholder-phone.jpg', '/placeholder-phone-2.jpg'],
          variants: [
            {
              id: 'v1',
              name: 'Color',
              value: 'Midnight Black',
              price: 45000,
              comparePrice: 50000,
              inventory: 15,
              sku: 'SAM-A54-128-BK'
            },
            {
              id: 'v2',
              name: 'Color',
              value: 'Arctic White',
              price: 45000,
              comparePrice: 50000,
              inventory: 8,
              sku: 'SAM-A54-128-WH'
            }
          ],
          basePrice: 45000,
          comparePrice: 50000,
          costPrice: 35000,
          inventory: 23,
          lowStockThreshold: 5,
          weight: 0.202,
          dimensions: { length: 15.8, width: 7.6, height: 0.8 },
          isActive: true,
          isDigital: false,
          tags: ['5G', 'Camera Phone', 'Samsung', 'Android'],
          seoTitle: 'Samsung Galaxy A54 5G - Best Price in Bangladesh',
          seoDescription: 'Buy Samsung Galaxy A54 5G at best price with warranty and free delivery.',
          rating: 4.5,
          reviewCount: 89,
          soldCount: 156,
          createdAt: '2025-07-01',
          updatedAt: '2025-07-07',
          status: 'active'
        },
        {
          id: '2',
          name: 'iPhone 15 Pro 256GB',
          description: 'The most advanced iPhone with titanium design and powerful A17 Pro chip.',
          category: 'electronics',
          subcategory: 'Smartphones',
          brand: 'Apple',
          sku: 'APPL-IP15P-256',
          images: ['/placeholder-iphone.jpg'],
          variants: [],
          basePrice: 135000,
          comparePrice: 145000,
          costPrice: 120000,
          inventory: 3,
          lowStockThreshold: 5,
          weight: 0.221,
          dimensions: { length: 14.7, width: 7.1, height: 0.8 },
          isActive: true,
          isDigital: false,
          tags: ['iPhone', 'Apple', 'Premium', 'iOS'],
          seoTitle: 'iPhone 15 Pro - Official Apple Store Bangladesh',
          seoDescription: 'Latest iPhone 15 Pro with titanium design and A17 Pro chip.',
          rating: 4.8,
          reviewCount: 34,
          soldCount: 67,
          createdAt: '2025-06-15',
          updatedAt: '2025-07-06',
          status: 'active'
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      basePrice: 0,
      comparePrice: 0,
      costPrice: 0,
      inventory: 0,
      lowStockThreshold: 5,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      isActive: true,
      isDigital: false,
      tags: [],
      seoTitle: '',
      seoDescription: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      basePrice: product.basePrice,
      comparePrice: product.comparePrice,
      costPrice: product.costPrice,
      inventory: product.inventory,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight,
      dimensions: product.dimensions,
      isActive: product.isActive,
      isDigital: product.isDigital,
      tags: product.tags,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.basePrice <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...editingProduct,
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        setProducts(prev => 
          prev.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
      } else {
        // Create new product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          sku: `PRD-${Date.now()}`,
          images: [],
          variants: [],
          rating: 0,
          reviewCount: 0,
          soldCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          status: formData.isActive ? 'active' : 'draft'
        };
        
        setProducts(prev => [newProduct, ...prev]);
      }

      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for products:`, Array.from(selectedProducts));
    setSelectedProducts(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return a.basePrice - b.basePrice;
      case 'inventory': return b.inventory - a.inventory;
      case 'rating': return b.rating - a.rating;
      case 'sold': return b.soldCount - a.soldCount;
      default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Manage your product catalog and inventory
              </p>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Update your product information' : 'Create a new product for your store'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <Tabs defaultValue="basic" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="inventory">Inventory</TabsTrigger>
                      <TabsTrigger value="seo">SEO & Tags</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter product name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            placeholder="Enter brand name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Detailed product description"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({...formData, category: value, subcategory: ''})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subcategory">Subcategory</Label>
                          <Select
                            value={formData.subcategory}
                            onValueChange={(value) => setFormData({...formData, subcategory: value})}
                            disabled={!formData.category}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories
                                .find(c => c.id === formData.category)
                                ?.subcategories.map(sub => (
                                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                          />
                          <Label htmlFor="isActive">Product is active</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isDigital"
                            checked={formData.isDigital}
                            onCheckedChange={(checked) => setFormData({...formData, isDigital: checked})}
                          />
                          <Label htmlFor="isDigital">Digital product</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="basePrice">Selling Price (৳) *</Label>
                          <Input
                            id="basePrice"
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comparePrice">Compare Price (৳)</Label>
                          <Input
                            id="comparePrice"
                            type="number"
                            value={formData.comparePrice}
                            onChange={(e) => setFormData({...formData, comparePrice: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="costPrice">Cost Price (৳)</Label>
                          <Input
                            id="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {formData.comparePrice > 0 && formData.basePrice > 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Discount: {(((formData.comparePrice - formData.basePrice) / formData.comparePrice) * 100).toFixed(1)}%
                            ({formData.comparePrice > formData.basePrice ? 'Valid' : 'Invalid'} discount)
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="inventory">Stock Quantity</Label>
                          <Input
                            id="inventory"
                            type="number"
                            value={formData.inventory}
                            onChange={(e) => setFormData({...formData, inventory: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                          <Input
                            id="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 5})}
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.001"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                          placeholder="0.000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Dimensions (cm)</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            placeholder="Length"
                            value={formData.dimensions.length}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, length: parseFloat(e.target.value) || 0 }
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Width"
                            value={formData.dimensions.width}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0 }
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Height"
                            value={formData.dimensions.height}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0 }
                            })}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                          id="seoTitle"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                          placeholder="SEO optimized title"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500">{formData.seoTitle.length}/60 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Textarea
                          id="seoDescription"
                          value={formData.seoDescription}
                          onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                          placeholder="SEO meta description"
                          maxLength={160}
                          rows={3}
                        />
                        <p className="text-xs text-gray-500">{formData.seoDescription.length}/160 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Product Tags</Label>
                        <Input
                          id="tags"
                          value={formData.tags.join(', ')}
                          onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                          placeholder="Enter tags separated by commas"
                        />
                        <p className="text-xs text-gray-500">Use relevant keywords to improve searchability</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-2 pt-6 border-t">
                    <Button type="submit">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Latest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="inventory">Stock</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="sold">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {selectedProducts.size} product(s) selected
              </span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                Deactivate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedProducts(new Set())}>
                Clear Selection
              </Button>
            </div>
          )}

          {/* Products List */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first product to get started'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedProducts);
                          if (e.target.checked) {
                            newSelected.add(product.id);
                          } else {
                            newSelected.delete(product.id);
                          }
                          setSelectedProducts(newSelected);
                        }}
                        className="mt-1"
                      />

                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
                      />

                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-lg">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.brand}</p>
                              <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                            </div>
                            <Badge className={getStatusColor(product.status)}>
                              {product.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{product.rating} ({product.reviewCount})</span>
                            </div>
                            <span>•</span>
                            <span>{product.soldCount} sold</span>
                            <span>•</span>
                            <span className={`font-medium ${product.inventory <= product.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                              {product.inventory} in stock
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ৳{product.basePrice.toLocaleString()}
                            </p>
                            {product.comparePrice > product.basePrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ৳{product.comparePrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                          
                          {product.inventory <= product.lowStockThreshold && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Low stock</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Updated: {new Date(product.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProductManager;