import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Clock, Star, Heart, ShoppingCart, Eye } from 'lucide-react';

interface RecentlyViewedProps {
  className?: string;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ className }) => {
  const recentlyViewed = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      image: '/api/placeholder/200/200',
      price: '৳1,45,000',
      originalPrice: '৳1,55,000',
      rating: 4.8,
      reviews: 245,
      viewedAt: '2 hours ago',
      category: 'Electronics',
      discount: '6% off',
      isWishlisted: true
    },
    {
      id: 2,
      name: 'Samsung Galaxy Watch 6',
      image: '/api/placeholder/200/200',
      price: '৳28,999',
      originalPrice: '৳32,999',
      rating: 4.6,
      reviews: 189,
      viewedAt: '5 hours ago',
      category: 'Wearables',
      discount: '12% off',
      isWishlisted: false
    },
    {
      id: 3,
      name: 'Nike Air Max 270',
      image: '/api/placeholder/200/200',
      price: '৳12,500',
      originalPrice: '৳15,000',
      rating: 4.7,
      reviews: 324,
      viewedAt: '1 day ago',
      category: 'Fashion',
      discount: '17% off',
      isWishlisted: true
    },
    {
      id: 4,
      name: 'MacBook Pro M3',
      image: '/api/placeholder/200/200',
      price: '৳1,85,000',
      originalPrice: '৳1,95,000',
      rating: 4.9,
      reviews: 156,
      viewedAt: '2 days ago',
      category: 'Computers',
      discount: '5% off',
      isWishlisted: false
    },
    {
      id: 5,
      name: 'Sony WH-1000XM5',
      image: '/api/placeholder/200/200',
      price: '৳32,999',
      originalPrice: '৳38,999',
      rating: 4.8,
      reviews: 412,
      viewedAt: '3 days ago',
      category: 'Audio',
      discount: '15% off',
      isWishlisted: true
    }
  ];

  return (
    <div className={`py-8 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600">Continue where you left off</p>
            </div>
          </div>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View All History
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {recentlyViewed.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                    {product.discount}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`absolute top-2 right-2 p-1 w-8 h-8 ${
                      product.isWishlisted ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${product.isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{product.viewedAt}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clear History */}
        <div className="text-center mt-8">
          <Button variant="outline" size="sm">
            Clear Viewing History
          </Button>
        </div>
      </div>
    </div>
  );
};