import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight,
  Smartphone,
  Shirt,
  Home,
  Gamepad2,
  Car,
  Baby,
  Coffee,
  Dumbbell
} from 'lucide-react';

interface TrendingCategoriesProps {
  timeRange: 'today' | 'week' | 'month';
  viewMode: 'grid' | 'list';
  className?: string;
}

export const TrendingCategories: React.FC<TrendingCategoriesProps> = ({ 
  timeRange, 
  viewMode, 
  className 
}) => {
  const categoryIcons = {
    'Electronics': Smartphone,
    'Fashion': Shirt,
    'Home & Garden': Home,
    'Gaming': Gamepad2,
    'Automotive': Car,
    'Baby & Kids': Baby,
    'Food & Beverages': Coffee,
    'Sports & Fitness': Dumbbell
  };

  const getTrendingData = (range: string) => {
    const baseData = [
      {
        id: 1,
        name: 'Electronics',
        icon: 'Electronics',
        currentRank: 1,
        previousRank: 2,
        searches: 45680,
        growth: 15.5,
        topProducts: ['iPhone 15', 'Samsung Galaxy S24', 'MacBook Pro'],
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50'
      },
      {
        id: 2,
        name: 'Fashion',
        icon: 'Fashion',
        currentRank: 2,
        previousRank: 1,
        searches: 38420,
        growth: -8.2,
        topProducts: ['Winter Jackets', 'Sneakers', 'Handbags'],
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50'
      },
      {
        id: 3,
        name: 'Home & Garden',
        icon: 'Home & Garden',
        currentRank: 3,
        previousRank: 4,
        searches: 28750,
        growth: 12.8,
        topProducts: ['Air Purifiers', 'Kitchen Sets', 'Decorations'],
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50'
      },
      {
        id: 4,
        name: 'Gaming',
        icon: 'Gaming',
        currentRank: 4,
        previousRank: 3,
        searches: 22340,
        growth: -5.1,
        topProducts: ['PS5 Games', 'Gaming Chairs', 'Keyboards'],
        color: 'from-violet-500 to-purple-500',
        bgColor: 'bg-violet-50'
      },
      {
        id: 5,
        name: 'Sports & Fitness',
        icon: 'Sports & Fitness',
        currentRank: 5,
        previousRank: 6,
        searches: 18920,
        growth: 22.3,
        topProducts: ['Yoga Mats', 'Dumbbells', 'Running Shoes'],
        color: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-50'
      },
      {
        id: 6,
        name: 'Baby & Kids',
        icon: 'Baby & Kids',
        currentRank: 6,
        previousRank: 5,
        searches: 15680,
        growth: -3.7,
        topProducts: ['Baby Care', 'Toys', 'Kids Clothes'],
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-50'
      },
      {
        id: 7,
        name: 'Automotive',
        icon: 'Automotive',
        currentRank: 7,
        previousRank: 7,
        searches: 12450,
        growth: 0.8,
        topProducts: ['Car Accessories', 'Motor Oil', 'Tires'],
        color: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gray-50'
      },
      {
        id: 8,
        name: 'Food & Beverages',
        icon: 'Food & Beverages',
        currentRank: 8,
        previousRank: 8,
        searches: 9870,
        growth: 1.2,
        topProducts: ['Organic Foods', 'Snacks', 'Beverages'],
        color: 'from-orange-500 to-yellow-500',
        bgColor: 'bg-orange-50'
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

  const trendingCategories = getTrendingData(timeRange);

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return { type: 'up', change: previous - current };
    if (current > previous) return { type: 'down', change: current - previous };
    return { type: 'same', change: 0 };
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const CategoryCard = ({ category, index }: { category: any; index: number }) => {
    const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons];
    const rankChange = getRankChange(category.currentRank, category.previousRank);
    const trendIcon = getTrendIcon(category.growth);
    
    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}>
        <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4 w-full' : ''}`}>
          {/* Rank and Category Info */}
          <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
              index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-500'
            }`}>
              #{category.currentRank}
            </div>
            
            {/* Rank Change Indicator */}
            <div className="flex flex-col items-center">
              {rankChange.type === 'up' && (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-bold">+{rankChange.change}</span>
                </div>
              )}
              {rankChange.type === 'down' && (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-bold">-{rankChange.change}</span>
                </div>
              )}
              {rankChange.type === 'same' && (
                <div className="flex items-center text-gray-500">
                  <Minus className="w-3 h-3" />
                  <span className="text-xs">-</span>
                </div>
              )}
            </div>
            
            {/* Category Icon */}
            <div className={`${category.bgColor} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
              <IconComponent className={`w-5 h-5 bg-gradient-to-br ${category.color} bg-clip-text text-transparent`} />
            </div>
            
            {/* Category Name */}
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                {trendIcon}
                <span className={`font-medium ${
                  category.growth > 0 ? 'text-green-600' : 
                  category.growth < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`${viewMode === 'list' ? 'flex items-center gap-6' : 'space-y-3'}`}>
            <div className={viewMode === 'list' ? 'text-center' : ''}>
              <div className="text-lg font-bold text-gray-900">
                {category.searches.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                Searches {timeRange === 'today' ? 'today' : `this ${timeRange}`}
              </div>
            </div>

            {/* Top Products */}
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <div className="text-xs text-gray-600 mb-1">Trending items:</div>
              <div className="flex flex-wrap gap-1">
                {category.topProducts.slice(0, viewMode === 'list' ? 5 : 3).map((product: string) => (
                  <Badge key={product} variant="outline" className="text-xs">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              size="sm" 
              className={`${viewMode === 'list' ? 'w-32' : 'w-full'} bg-gradient-to-r ${category.color} hover:shadow-lg`}
            >
              Explore
              <ArrowRight className="w-4 h-4 ml-1" />
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
              {trendingCategories.length}
            </div>
            <div className="text-sm text-gray-600">Categories Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(trendingCategories.reduce((sum, cat) => sum + cat.growth, 0) / trendingCategories.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Growth</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trendingCategories.reduce((sum, cat) => sum + cat.searches, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Searches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {trendingCategories.filter(cat => cat.growth > 10).length}
            </div>
            <div className="text-sm text-gray-600">Hot Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer Banner */}
      {trendingCategories.length > 0 && (
        <Card className={`bg-gradient-to-r ${trendingCategories[0].color} border-0 text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  🏆 Top Trending: {trendingCategories[0].name}
                </h3>
                <p className="text-white/90">
                  Leading with {trendingCategories[0].searches.toLocaleString()} searches 
                  and {trendingCategories[0].growth.toFixed(1)}% growth!
                </p>
              </div>
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Shop Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
          : 'space-y-4'
      }>
        {trendingCategories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
    </div>
  );
};