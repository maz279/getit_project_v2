import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  ShoppingBag,
  Crown,
  ArrowRight,
  Verified
} from 'lucide-react';

interface TrendingBrandsProps {
  timeRange: 'today' | 'week' | 'month';
  viewMode: 'grid' | 'list';
  className?: string;
}

export const TrendingBrands: React.FC<TrendingBrandsProps> = ({ 
  timeRange, 
  viewMode, 
  className 
}) => {
  const getTrendingBrands = (range: string) => {
    const baseData = [
      {
        id: 1,
        name: 'Apple',
        logo: '🍎',
        currentRank: 1,
        previousRank: 2,
        searches: 89420,
        growth: 23.5,
        followers: 2456000,
        category: 'Electronics',
        averageRating: 4.8,
        totalProducts: 245,
        topProducts: ['iPhone 15 Pro', 'MacBook Pro M3', 'AirPods Pro'],
        verificationLevel: 'premium',
        color: 'from-gray-700 to-black',
        bgColor: 'bg-gray-50'
      },
      {
        id: 2,
        name: 'Samsung',
        logo: '📱',
        currentRank: 2,
        previousRank: 1,
        searches: 76850,
        growth: -5.2,
        followers: 2134000,
        category: 'Electronics',
        averageRating: 4.6,
        totalProducts: 312,
        topProducts: ['Galaxy S24 Ultra', 'QLED TV', 'Galaxy Watch'],
        verificationLevel: 'verified',
        color: 'from-blue-600 to-cyan-500',
        bgColor: 'bg-blue-50'
      },
      {
        id: 3,
        name: 'Nike',
        logo: '👟',
        currentRank: 3,
        previousRank: 4,
        searches: 65320,
        growth: 18.7,
        followers: 1876000,
        category: 'Fashion',
        averageRating: 4.7,
        totalProducts: 189,
        topProducts: ['Air Max 270', 'Jordan 1', 'Dri-FIT T-Shirt'],
        verificationLevel: 'verified',
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50'
      },
      {
        id: 4,
        name: 'Sony',
        logo: '🎮',
        currentRank: 4,
        previousRank: 3,
        searches: 54210,
        growth: -8.1,
        followers: 1523000,
        category: 'Electronics',
        averageRating: 4.5,
        totalProducts: 156,
        topProducts: ['PS5 Console', 'WH-1000XM5', 'A7 IV Camera'],
        verificationLevel: 'verified',
        color: 'from-indigo-600 to-purple-600',
        bgColor: 'bg-indigo-50'
      },
      {
        id: 5,
        name: 'Adidas',
        logo: '⚽',
        currentRank: 5,
        previousRank: 6,
        searches: 48670,
        growth: 15.3,
        followers: 1298000,
        category: 'Sports',
        averageRating: 4.4,
        totalProducts: 203,
        topProducts: ['Ultraboost 23', 'Predator Boots', 'Three Stripes'],
        verificationLevel: 'verified',
        color: 'from-green-600 to-teal-500',
        bgColor: 'bg-green-50'
      },
      {
        id: 6,
        name: 'Microsoft',
        logo: '💻',
        currentRank: 6,
        previousRank: 5,
        searches: 42890,
        growth: -3.8,
        followers: 1145000,
        category: 'Technology',
        averageRating: 4.3,
        totalProducts: 98,
        topProducts: ['Surface Pro 9', 'Xbox Series X', 'Office 365'],
        verificationLevel: 'verified',
        color: 'from-blue-500 to-green-500',
        bgColor: 'bg-blue-50'
      },
      {
        id: 7,
        name: 'H&M',
        logo: '👗',
        currentRank: 7,
        previousRank: 8,
        searches: 38450,
        growth: 12.4,
        followers: 987000,
        category: 'Fashion',
        averageRating: 4.2,
        totalProducts: 567,
        topProducts: ['Winter Collection', 'Basic Tees', 'Jeans'],
        verificationLevel: 'standard',
        color: 'from-pink-500 to-red-500',
        bgColor: 'bg-pink-50'
      },
      {
        id: 8,
        name: 'Canon',
        logo: '📷',
        currentRank: 8,
        previousRank: 7,
        searches: 34210,
        growth: -6.7,
        followers: 756000,
        category: 'Photography',
        averageRating: 4.6,
        totalProducts: 87,
        topProducts: ['EOS R6 Mark II', 'RF 24-70mm', 'Pixma Printer'],
        verificationLevel: 'verified',
        color: 'from-red-600 to-orange-500',
        bgColor: 'bg-red-50'
      }
    ];

    // Adjust data based on time range
    if (range === 'week') {
      return baseData.map(item => ({
        ...item,
        searches: Math.floor(item.searches * 7),
        growth: item.growth * 0.8
      }));
    } else if (range === 'month') {
      return baseData.map(item => ({
        ...item,
        searches: Math.floor(item.searches * 30),
        growth: item.growth * 0.6
      }));
    }
    
    return baseData;
  };

  const trendingBrands = getTrendingBrands(timeRange);

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'premium':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <Verified className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const BrandCard = ({ brand, index }: { brand: any; index: number }) => {
    const isRising = brand.currentRank < brand.previousRank;
    const isFalling = brand.currentRank > brand.previousRank;
    const verificationIcon = getVerificationIcon(brand.verificationLevel);
    
    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}>
        <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4 w-full' : ''}`}>
          {/* Brand Header */}
          <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
              index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-500'
            }`}>
              #{brand.currentRank}
            </div>
            
            {/* Trend Indicator */}
            <div className="flex flex-col items-center">
              {isRising && (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-bold">↑{brand.previousRank - brand.currentRank}</span>
                </div>
              )}
              {isFalling && (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-bold">↓{brand.currentRank - brand.previousRank}</span>
                </div>
              )}
              {!isRising && !isFalling && (
                <div className="text-gray-500 text-xs">—</div>
              )}
            </div>
            
            {/* Brand Logo & Info */}
            <div className={`${brand.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
              <div className="text-2xl">{brand.logo}</div>
            </div>
            
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{brand.name}</h3>
                {verificationIcon}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="text-xs">{brand.category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{brand.averageRating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Stats */}
          <div className={`${viewMode === 'list' ? 'flex items-center gap-6' : 'grid grid-cols-2 gap-4 mb-4'}`}>
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">
                {brand.searches.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Searches</div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">
                {(brand.followers / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">
                {brand.totalProducts}
              </div>
              <div className="text-xs text-gray-600">Products</div>
            </div>
            
            <div className="text-center">
              <div className={`font-bold text-lg ${
                brand.growth > 0 ? 'text-green-600' : 
                brand.growth < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {brand.growth > 0 ? '+' : ''}{brand.growth.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Growth</div>
            </div>
          </div>

          {/* Top Products */}
          <div className={`${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
            <div className="text-xs text-gray-600 mb-2">Top products:</div>
            <div className="flex flex-wrap gap-1">
              {brand.topProducts.map((product: string) => (
                <Badge key={product} variant="outline" className="text-xs">
                  {product}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-2 ${viewMode === 'list' ? 'w-40' : ''}`}>
            <Button 
              size="sm" 
              className={`flex-1 bg-gradient-to-r ${brand.color} text-white hover:shadow-lg`}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Shop
            </Button>
            <Button size="sm" variant="outline">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trendingBrands.filter(b => b.verificationLevel === 'premium').length}
            </div>
            <div className="text-sm text-gray-600">Premium Brands</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {trendingBrands.filter(b => b.growth > 10).length}
            </div>
            <div className="text-sm text-gray-600">Rising Brands</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(trendingBrands.reduce((sum, b) => sum + b.averageRating, 0) / trendingBrands.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {Math.round(trendingBrands.reduce((sum, b) => sum + b.followers, 0) / 1000000)}M
            </div>
            <div className="text-sm text-gray-600">Total Followers</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Brand Spotlight */}
      {trendingBrands.length > 0 && (
        <Card className={`bg-gradient-to-r ${trendingBrands[0].color} border-0 text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{trendingBrands[0].logo}</div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    Brand of the {timeRange === 'today' ? 'Day' : timeRange === 'week' ? 'Week' : 'Month'}: {trendingBrands[0].name}
                  </h3>
                  <p className="text-white/90 text-lg">
                    {trendingBrands[0].searches.toLocaleString()} searches • 
                    {trendingBrands[0].growth > 0 ? ' +' : ' '}{trendingBrands[0].growth.toFixed(1)}% growth • 
                    {(trendingBrands[0].followers / 1000000).toFixed(1)}M followers
                  </p>
                </div>
              </div>
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-lg px-6 py-3">
                Explore Brand
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brands Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
          : 'space-y-4'
      }>
        {trendingBrands.map((brand, index) => (
          <BrandCard key={brand.id} brand={brand} index={index} />
        ))}
      </div>
    </div>
  );
};