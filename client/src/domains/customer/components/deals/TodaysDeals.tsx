import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Clock, 
  Zap, 
  TrendingUp,
  MapPin,
  Truck,
  Filter
} from 'lucide-react';

interface TodaysDealsProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const TodaysDeals: React.FC<TodaysDealsProps> = ({ viewMode = 'grid', className }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Deals', count: 156 },
    { id: 'lightning', label: 'Lightning Deals', count: 45 },
    { id: 'limited', label: 'Limited Time', count: 67 },
    { id: 'clearance', label: 'Clearance', count: 34 },
    { id: 'bundle', label: 'Bundle Deals', count: 23 }
  ];

  const todaysDeals = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Space Black',
      image: '/api/placeholder/300/300',
      originalPrice: '৳1,55,000',
      salePrice: '৳1,35,000',
      discount: 13,
      saved: '৳20,000',
      rating: 4.8,
      reviews: 245,
      seller: 'Apple Store BD',
      location: 'Dhaka',
      shipping: 'Free',
      deliveryTime: 'Same Day',
      stockLeft: 8,
      totalStock: 50,
      timeLeft: '6h 24m',
      badges: ['Lightning Deal', 'Verified Seller'],
      isWishlisted: false,
      category: 'electronics',
      dealType: 'lightning'
    },
    {
      id: 2,
      name: 'Samsung 65" Neo QLED 8K Smart TV',
      image: '/api/placeholder/300/300',
      originalPrice: '৳3,50,000',
      salePrice: '৳2,75,000',
      discount: 21,
      saved: '৳75,000',
      rating: 4.7,
      reviews: 128,
      seller: 'Samsung Official',
      location: 'Chittagong',
      shipping: 'Free',
      deliveryTime: 'Next Day',
      stockLeft: 3,
      totalStock: 20,
      timeLeft: '12h 18m',
      badges: ['Best Deal', 'Official Store'],
      isWishlisted: true,
      category: 'electronics',
      dealType: 'limited'
    },
    {
      id: 3,
      name: 'MacBook Pro M3 Max 16" 1TB SSD',
      image: '/api/placeholder/300/300',
      originalPrice: '৳4,50,000',
      salePrice: '৳4,15,000',
      discount: 8,
      saved: '৳35,000',
      rating: 4.9,
      reviews: 89,
      seller: 'TechWorld BD',
      location: 'Sylhet',
      shipping: '৳500',
      deliveryTime: '2-3 Days',
      stockLeft: 15,
      totalStock: 25,
      timeLeft: '18h 45m',
      badges: ['Premium Deal', 'Fast Shipping'],
      isWishlisted: false,
      category: 'computers',
      dealType: 'clearance'
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5 Wireless Headphones',
      image: '/api/placeholder/300/300',
      originalPrice: '৳38,999',
      salePrice: '৳28,999',
      discount: 26,
      saved: '৳10,000',
      rating: 4.8,
      reviews: 412,
      seller: 'Audio Paradise',
      location: 'Rajshahi',
      shipping: 'Free',
      deliveryTime: 'Express',
      stockLeft: 25,
      totalStock: 100,
      timeLeft: '4h 32m',
      badges: ['Hot Deal', 'Express Delivery'],
      isWishlisted: true,
      category: 'audio',
      dealType: 'bundle'
    },
    {
      id: 5,
      name: 'Canon EOS R6 Mark II Mirrorless Camera',
      image: '/api/placeholder/300/300',
      originalPrice: '৳2,85,000',
      salePrice: '৳2,45,000',
      discount: 14,
      saved: '৳40,000',
      rating: 4.6,
      reviews: 156,
      seller: 'Camera House',
      location: 'Khulna',
      shipping: 'Free',
      deliveryTime: '3-5 Days',
      stockLeft: 5,
      totalStock: 15,
      timeLeft: '8h 15m',
      badges: ['Pro Deal', 'Limited Stock'],
      isWishlisted: false,
      category: 'cameras',
      dealType: 'lightning'
    },
    {
      id: 6,
      name: 'Nike Air Max 270 React Sneakers',
      image: '/api/placeholder/300/300',
      originalPrice: '৳15,999',
      salePrice: '৳9,999',
      discount: 38,
      saved: '৳6,000',
      rating: 4.5,
      reviews: 324,
      seller: 'Nike Store BD',
      location: 'Dhaka',
      shipping: 'Free',
      deliveryTime: 'Same Day',
      stockLeft: 42,
      totalStock: 80,
      timeLeft: '14h 28m',
      badges: ['Fashion Deal', 'Same Day'],
      isWishlisted: false,
      category: 'fashion',
      dealType: 'clearance'
    }
  ];

  const filteredDeals = selectedFilter === 'all' 
    ? todaysDeals 
    : todaysDeals.filter(deal => deal.dealType === selectedFilter);

  const ProductCard = ({ deal, isListView = false }: { deal: any; isListView?: boolean }) => {
    const stockPercentage = (deal.stockLeft / deal.totalStock) * 100;
    
    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 ${isListView ? 'flex' : ''}`}>
        <CardContent className={`p-4 ${isListView ? 'flex gap-4 w-full' : ''}`}>
          {/* Product Image */}
          <div className={`relative ${isListView ? 'w-48 h-48 flex-shrink-0' : 'w-full h-48'} mb-3`}>
            <img
              src={deal.image}
              alt={deal.name}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges and Actions */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className="bg-red-500 text-white text-xs font-bold">
                {deal.discount}% OFF
              </Badge>
              {deal.dealType === 'lightning' && (
                <Badge className="bg-yellow-500 text-white text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Lightning
                </Badge>
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              className={`absolute top-2 right-2 p-1 w-8 h-8 ${
                deal.isWishlisted ? 'bg-red-50 border-red-200' : 'bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${deal.isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </Button>

            {/* Time Left Badge */}
            <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {deal.timeLeft}
            </Badge>
          </div>

          {/* Product Info */}
          <div className={`${isListView ? 'flex-1' : ''} space-y-3`}>
            {/* Deal Badges */}
            <div className="flex flex-wrap gap-1">
              {deal.badges.map((badge: string) => (
                <Badge key={badge} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
            
            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${isListView ? 'text-lg' : 'text-sm'}`}>
              {deal.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600">{deal.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({deal.reviews} reviews)</span>
            </div>
            
            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-gray-900 ${isListView ? 'text-2xl' : 'text-lg'}`}>
                  {deal.salePrice}
                </span>
                <span className="text-sm text-gray-500 line-through">{deal.originalPrice}</span>
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">You save: {deal.saved}</span>
              </div>
            </div>

            {/* Stock Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-600 font-medium">
                  Only {deal.stockLeft} left in stock!
                </span>
                <span className="text-gray-500">
                  {deal.totalStock - deal.stockLeft} sold
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${100 - stockPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Seller and Shipping Info */}
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{deal.seller} • {deal.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>Shipping: {deal.shipping}</span>
                </div>
                <span>{deal.deliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-2 mt-4 ${isListView ? 'flex-col w-32' : ''}`}>
            <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Deal Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="text-xs">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Stats Bar */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium">Today's Highlights:</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-bold">{filteredDeals.length} deals active</span>
                <span className="text-blue-600">Average 25% savings</span>
                <span className="text-purple-600">Fast delivery available</span>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-700">
              <Clock className="w-3 h-3 mr-1" />
              Deals refresh in 4h 23m
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
      }>
        {filteredDeals.map((deal) => (
          <ProductCard 
            key={deal.id} 
            deal={deal} 
            isListView={viewMode === 'list'} 
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Deals ({Math.floor(Math.random() * 50) + 20} more available)
        </Button>
      </div>
    </div>
  );
};