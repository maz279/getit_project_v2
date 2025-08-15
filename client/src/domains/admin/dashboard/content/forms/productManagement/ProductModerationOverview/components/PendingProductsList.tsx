/**
 * PHASE 2: PENDING PRODUCTS LIST COMPONENT
 * Product queue management with detailed review interface
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Star, 
  Flag, 
  Eye, 
  MessageSquare, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Image,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../../../../store';
import { 
  selectProduct, 
  deselectProduct, 
  moderateProduct 
} from '../../../../../../../../store/slices/moderationSlice';
import type { ModerationProduct } from '../types/moderationTypes';

interface PendingProductsListProps {
  className?: string;
  viewMode?: 'list' | 'grid' | 'detailed';
  onProductClick?: (product: ModerationProduct) => void;
}

interface ProductCardProps {
  product: ModerationProduct;
  isSelected: boolean;
  onToggleSelect: (productId: string) => void;
  onModerate: (productId: string, action: string, reason?: string, notes?: string) => void;
  viewMode: 'list' | 'grid' | 'detailed';
}

// Product Card Component
const ProductCard = memo<ProductCardProps>(({ 
  product, 
  isSelected, 
  onToggleSelect, 
  onModerate,
  viewMode 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-review': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'content-review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quality-check': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleModerate = useCallback((action: string) => {
    onModerate(product.id, action, moderationReason, moderationNotes);
    setShowActions(false);
    setModerationReason('');
    setModerationNotes('');
  }, [product.id, moderationReason, moderationNotes, onModerate]);

  if (viewMode === 'grid') {
    return (
      <Card className={`hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(product.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                <Badge className={getPriorityColor(product.priority)} variant="outline">
                  {product.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{product.vendor}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{product.price}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs">{product.score}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all border-l-4 border-l-blue-500 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(product.id)}
              />
              <h4 className="font-bold text-xl">{product.name}</h4>
              <Badge className={getPriorityColor(product.priority)} variant="outline">
                {product.priority}
              </Badge>
              <Badge className={getStatusColor(product.status)} variant="outline">
                {product.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><strong>Product ID:</strong> {product.id}</div>
              <div><strong>Vendor:</strong> {product.vendor}</div>
              <div><strong>Category:</strong> {product.category}</div>
              <div><strong>Price:</strong> {product.price}</div>
              <div><strong>Submitted:</strong> {product.submittedAt}</div>
              <div className="flex items-center">
                <strong className="mr-2">Quality Score:</strong>
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-bold text-yellow-600">{product.score}/100</span>
              </div>
            </div>

            {/* Flags */}
            {product.flags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.flags.map((flag, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    <Flag className="h-3 w-3 mr-1" />
                    {flag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <strong className="text-sm">Description:</strong>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}

            {/* Moderator Notes */}
            {product.moderatorNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-yellow-600" />
                  <strong className="text-sm text-yellow-800">Previous Notes:</strong>
                </div>
                <p className="text-sm text-yellow-700">{product.moderatorNotes}</p>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Quick Actions</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                >
                  {showActions ? 'Hide' : 'Show'}
                </Button>
              </div>

              {/* Quality Score Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quality Score</span>
                  <span className="text-sm">{product.score}/100</span>
                </div>
                <Progress value={product.score} className="h-2" />
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModerate('approve')}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowActions(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowActions(true)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowActions(true)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Escalate
                </Button>
              </div>

              {/* View Details */}
              <div className="pt-2 border-t">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </div>

            {/* Extended Actions */}
            {showActions && (
              <div className="mt-4 bg-white border rounded-lg p-4 space-y-4">
                <h6 className="font-medium">Moderation Action</h6>
                
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Select value={moderationReason} onValueChange={setModerationReason}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quality-approved">Quality Approved</SelectItem>
                      <SelectItem value="minor-issues">Minor Issues Fixed</SelectItem>
                      <SelectItem value="quality-issues">Quality Issues</SelectItem>
                      <SelectItem value="policy-violation">Policy Violation</SelectItem>
                      <SelectItem value="missing-info">Missing Information</SelectItem>
                      <SelectItem value="needs-review">Needs Further Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Add detailed notes about this review..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleModerate('approve')}
                    disabled={!moderationReason}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleModerate('reject')}
                    disabled={!moderationReason}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Main Component
export const PendingProductsList = memo<PendingProductsListProps>(({
  className = '',
  viewMode = 'detailed',
  onProductClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { products, selectedProducts, loading, error } = useSelector((state: RootState) => ({
    products: state.moderation.products,
    selectedProducts: state.moderation.selectedProducts,
    loading: state.moderation.loading.products,
    error: state.moderation.errors.products,
  }));

  // Handle product selection
  const handleToggleSelect = useCallback((productId: string) => {
    if (selectedProducts.includes(productId)) {
      dispatch(deselectProduct(productId));
    } else {
      dispatch(selectProduct(productId));
    }
  }, [selectedProducts, dispatch]);

  // Handle moderation
  const handleModerate = useCallback(async (
    productId: string, 
    action: string, 
    reason?: string, 
    notes?: string
  ) => {
    try {
      await dispatch(moderateProduct({
        productId,
        action: action as 'approve' | 'reject' | 'flag' | 'escalate',
        reason,
        notes,
      })).unwrap();
    } catch (error) {
      console.error('Moderation failed:', error);
    }
  }, [dispatch]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Products</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Products</h3>
          <p className="text-gray-600 mb-4">All products have been reviewed. Great work!</p>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onToggleSelect={handleToggleSelect}
              onModerate={handleModerate}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* List/Detailed view */}
      {(viewMode === 'list' || viewMode === 'detailed') && (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onToggleSelect={handleToggleSelect}
              onModerate={handleModerate}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {products.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

PendingProductsList.displayName = 'PendingProductsList';