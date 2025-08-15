import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Car, 
  Heart, 
  Gamepad2,
  Baby,
  Coffee,
  Dumbbell,
  TrendingUp,
  Percent,
  ArrowRight
} from 'lucide-react';

interface DealCategoriesProps {
  className?: string;
}

export const DealCategories: React.FC<DealCategoriesProps> = ({ className }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const dealCategories = [
    {
      id: 'electronics',
      name: 'Electronics',
      icon: Smartphone,
      discount: 'Up to 70%',
      deals: 245,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      trending: true,
      topDeal: 'iPhone 15 Pro - ৳20,000 off'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: Shirt,
      discount: 'Up to 60%',
      deals: 189,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      trending: true,
      topDeal: 'Designer Sarees - Buy 2 Get 1'
    },
    {
      id: 'home',
      name: 'Home & Living',
      icon: Home,
      discount: 'Up to 55%',
      deals: 156,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      trending: false,
      topDeal: 'Furniture Sets - 40% off'
    },
    {
      id: 'sports',
      name: 'Sports & Fitness',
      icon: Dumbbell,
      discount: 'Up to 45%',
      deals: 98,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      trending: true,
      topDeal: 'Gym Equipment - Flash Sale'
    },
    {
      id: 'automotive',
      name: 'Automotive',
      icon: Car,
      discount: 'Up to 40%',
      deals: 76,
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-50',
      trending: false,
      topDeal: 'Car Accessories - Bundle Deal'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: Gamepad2,
      discount: 'Up to 65%',
      deals: 134,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      trending: true,
      topDeal: 'PS5 Games - 3 for ৳5000'
    },
    {
      id: 'baby',
      name: 'Baby & Kids',
      icon: Baby,
      discount: 'Up to 50%',
      deals: 112,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      trending: false,
      topDeal: 'Baby Care Essentials - 40% off'
    },
    {
      id: 'food',
      name: 'Food & Beverages',
      icon: Coffee,
      discount: 'Up to 35%',
      deals: 89,
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-50',
      trending: false,
      topDeal: 'Organic Products - Special Price'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏷️ Shop by Categories
        </h2>
        <p className="text-gray-600">
          Exclusive deals across all your favorite categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dealCategories.map((category) => {
          const Icon = category.icon;
          const isHovered = hoveredCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                isHovered ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CardContent className="p-4 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                {/* Trending Badge */}
                {category.trending && (
                  <Badge className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}

                {/* Category Icon */}
                <div className={`${category.bgColor} p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 bg-gradient-to-br ${category.color} bg-clip-text text-transparent`} />
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">{category.discount}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {category.deals} deals available
                  </p>

                  {/* Top Deal (shown on hover) */}
                  {isHovered && (
                    <div className="animate-fadeIn">
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                        <span className="font-medium text-blue-800">
                          🔥 {category.topDeal}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shop Button */}
                <Button 
                  size="sm" 
                  className={`w-full mt-4 bg-gradient-to-r ${category.color} hover:shadow-lg transition-all`}
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Category Banner */}
      <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-0 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-18c9.941 0 18 8.059 18 18s-8.059 18-18 18-18-8.059-18-18 8.059-18 18-18z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">
              🎯 Category of the Day: Electronics
            </h3>
            <p className="text-lg text-white/90 mb-4">
              Extra 10% off on top of existing discounts - Limited time only!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                245 Products on Sale
              </Badge>
              <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                Up to 70% Off
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">1000+</div>
            <div className="text-sm text-gray-600">Active Deals</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">70%</div>
            <div className="text-sm text-gray-600">Max Savings</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">24h</div>
            <div className="text-sm text-gray-600">Deal Updates</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};