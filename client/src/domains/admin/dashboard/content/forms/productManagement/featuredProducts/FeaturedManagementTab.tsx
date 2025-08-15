
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Search, Star, StarOff, Eye, MousePointer, TrendingUp, Calendar, Filter } from 'lucide-react';
import { FeaturedProduct } from './types';

interface FeaturedManagementTabProps {
  featuredProducts: FeaturedProduct[];
  onProductToggle: (productId: string) => void;
}

export const FeaturedManagementTab: React.FC<FeaturedManagementTabProps> = ({
  featuredProducts,
  onProductToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || product.featuredType === filterType;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filter Featured Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Featured Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="homepage">Homepage</SelectItem>
                <SelectItem value="category">Category Pages</SelectItem>
                <SelectItem value="search">Search Results</SelectItem>
                <SelectItem value="banner">Banner Ads</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Star className="h-4 w-4 mr-2" />
              Add Featured
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Featured Products ({filteredProducts.length})
            </span>
            <Badge variant="outline">{filteredProducts.filter(p => p.isFeatured).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          <div className="text-sm font-semibold text-green-600">৳{product.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">#{product.featuredPosition}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        product.featuredType === 'homepage' ? 'bg-blue-500' :
                        product.featuredType === 'category' ? 'bg-green-500' :
                        product.featuredType === 'search' ? 'bg-purple-500' : 'bg-orange-500'
                      }>
                        {product.featuredType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Eye className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{product.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MousePointer className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{product.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span>{product.conversionRate}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{formatDate(product.featuredStartDate)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(product.featuredEndDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isFeatured ? 'default' : 'secondary'}>
                        {product.isFeatured ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={product.isFeatured ? 'destructive' : 'default'}
                          onClick={() => onProductToggle(product.id)}
                        >
                          {product.isFeatured ? (
                            <>
                              <StarOff className="h-4 w-4 mr-1" />
                              Unfeature
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-1" />
                              Feature
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
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
    </div>
  );
};
