
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Edit, Trash2, Eye, Download, Upload, Settings, Package } from 'lucide-react';
import { ProductData, BulkAction } from './types';

interface ProductsManagementTabProps {
  products: ProductData[];
  bulkActions: BulkAction[];
}

export const ProductsManagementTab: React.FC<ProductsManagementTabProps> = ({
  products,
  bulkActions
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedBulkAction, setSelectedBulkAction] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'discontinued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkAction = () => {
    if (selectedProducts.length === 0 || !selectedBulkAction) return;
    
    console.log('Executing bulk action:', selectedBulkAction, 'on products:', selectedProducts);
    // Implement bulk action logic here
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Bulk Actions ({selectedProducts.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {bulkActions.map((action) => (
              <div 
                key={action.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedBulkAction === action.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedBulkAction(action.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <h4 className="font-semibold text-sm">{action.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Select value={selectedBulkAction} onValueChange={setSelectedBulkAction}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select bulk action" />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    {action.icon} {action.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleBulkAction}
              disabled={selectedProducts.length === 0 || !selectedBulkAction}
            >
              Apply to {selectedProducts.length} products
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Products
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Products Management
            </span>
            <div className="text-sm text-gray-500">
              {selectedProducts.length} of {products.length} selected
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox 
                      checked={selectedProducts.length === products.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.images[0] || '/api/placeholder/40/40'} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>{product.category.split(' > ')[1] || product.category}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{formatCurrency(product.price)}</div>
                        <div className="text-xs text-gray-500">Cost: {formatCurrency(product.cost)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.stock < 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600 font-semibold">{formatCurrency(product.revenue)}</div>
                        <div className="text-gray-500">{product.sold} sold</div>
                        <div className="text-yellow-600">★ {product.rating}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit Product">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete Product">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats for Selected Products */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Products Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedProducts.length}</div>
                <p className="text-sm text-gray-600">Products Selected</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    products
                      .filter(p => selectedProducts.includes(p.id))
                      .reduce((sum, p) => sum + p.revenue, 0)
                  )}
                </div>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {products
                    .filter(p => selectedProducts.includes(p.id))
                    .reduce((sum, p) => sum + p.stock, 0)}
                </div>
                <p className="text-sm text-gray-600">Total Stock</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {products
                    .filter(p => selectedProducts.includes(p.id))
                    .reduce((sum, p) => sum + p.sold, 0)}
                </div>
                <p className="text-sm text-gray-600">Units Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
