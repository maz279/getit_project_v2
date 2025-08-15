/**
 * Phase 3: Aware Stage - Category Recommendations
 * Amazon.com 5 A's Framework Implementation
 * Smart Category Discovery with AI-Powered Recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Brain, 
  Target, 
  Star, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Sparkles,
  Filter,
  Grid3X3,
  List,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryRecommendationsProps {
  userId?: string;
  className?: string;
}

interface SmartCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  productCount: number;
  matchScore: number;
  trending: boolean;
  subcategories: string[];
  popularProducts: any[];
  userInterest: number;
  avgPrice: number;
  tags: string[];
}

const CategoryRecommendations: React.FC<CategoryRecommendationsProps> = ({
  userId,
  className,
}) => {
  const [smartCategories, setSmartCategories] = useState<SmartCategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'trending' | 'interest'>('relevance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-powered category analysis
    const loadSmartCategories = () => {
      const categories: SmartCategory[] = [
        {
          id: 'electronics-smart',
          name: 'স্মার্ট ইলেকট্রনিক্স',
          nameEn: 'Smart Electronics',
          description: 'Latest gadgets and smart devices tailored for your tech preferences',
          icon: '📱',
          color: 'bg-blue-500',
          gradient: 'from-blue-500 to-purple-600',
          productCount: 1247,
          matchScore: 95,
          trending: true,
          subcategories: ['Smartphones', 'Smart Watches', 'Gaming Gear', 'Audio Devices'],
          popularProducts: [
            { name: 'iPhone 15 Pro', price: 125000, rating: 4.8 },
            { name: 'Samsung Galaxy Watch', price: 32000, rating: 4.6 },
            { name: 'AirPods Pro', price: 28000, rating: 4.7 }
          ],
          userInterest: 88,
          avgPrice: 15000,
          tags: ['trending', 'high-tech', 'premium']
        },
        {
          id: 'fashion-cultural',
          name: 'সাংস্কৃতিক ফ্যাশন',
          nameEn: 'Cultural Fashion',
          description: 'Traditional and modern Bengali fashion for special occasions',
          icon: '👗',
          color: 'bg-pink-500',
          gradient: 'from-pink-500 to-rose-600',
          productCount: 856,
          matchScore: 92,
          trending: true,
          subcategories: ['Sarees', 'Kurtas', 'Panjabis', 'Traditional Jewelry'],
          popularProducts: [
            { name: 'Silk Saree Collection', price: 8500, rating: 4.9 },
            { name: 'Designer Kurta', price: 3200, rating: 4.7 },
            { name: 'Traditional Jewelry Set', price: 5500, rating: 4.8 }
          ],
          userInterest: 82,
          avgPrice: 4500,
          tags: ['cultural', 'traditional', 'festive']
        },
        {
          id: 'home-smart',
          name: 'স্মার্ট হোম',
          nameEn: 'Smart Home',
          description: 'Transform your home with intelligent appliances and decor',
          icon: '🏠',
          color: 'bg-green-500',
          gradient: 'from-green-500 to-teal-600',
          productCount: 623,
          matchScore: 89,
          trending: false,
          subcategories: ['Smart Appliances', 'Home Decor', 'Kitchen Tools', 'Furniture'],
          popularProducts: [
            { name: 'Smart Air Conditioner', price: 45000, rating: 4.6 },
            { name: 'Decorative Lights', price: 2800, rating: 4.5 },
            { name: 'Kitchen Set', price: 12000, rating: 4.7 }
          ],
          userInterest: 75,
          avgPrice: 18000,
          tags: ['smart', 'home', 'modern']
        },
        {
          id: 'health-fitness',
          name: 'স্বাস্থ্য ও ফিটনেস',
          nameEn: 'Health & Fitness',
          description: 'Wellness products and fitness equipment for healthy living',
          icon: '💪',
          color: 'bg-orange-500',
          gradient: 'from-orange-500 to-red-600',
          productCount: 445,
          matchScore: 86,
          trending: true,
          subcategories: ['Fitness Equipment', 'Supplements', 'Yoga & Meditation', 'Health Monitors'],
          popularProducts: [
            { name: 'Smart Fitness Band', price: 3500, rating: 4.5 },
            { name: 'Yoga Mat Set', price: 1800, rating: 4.6 },
            { name: 'Protein Supplement', price: 2200, rating: 4.4 }
          ],
          userInterest: 68,
          avgPrice: 2800,
          tags: ['health', 'fitness', 'wellness']
        },
        {
          id: 'books-education',
          name: 'বই ও শিক্ষা',
          nameEn: 'Books & Education',
          description: 'Educational resources and Bengali literature for learning',
          icon: '📚',
          color: 'bg-purple-500',
          gradient: 'from-purple-500 to-indigo-600',
          productCount: 789,
          matchScore: 83,
          trending: false,
          subcategories: ['Bengali Literature', 'Academic Books', 'Children\'s Books', 'E-learning'],
          popularProducts: [
            { name: 'Bengali Novel Collection', price: 1200, rating: 4.8 },
            { name: 'Programming Books', price: 2800, rating: 4.7 },
            { name: 'Children\'s Story Books', price: 800, rating: 4.9 }
          ],
          userInterest: 71,
          avgPrice: 1500,
          tags: ['education', 'literature', 'learning']
        },
        {
          id: 'baby-care',
          name: 'শিশু যত্ন',
          nameEn: 'Baby & Kids',
          description: 'Everything for your little ones - toys, clothes, and care products',
          icon: '👶',
          color: 'bg-yellow-500',
          gradient: 'from-yellow-500 to-orange-600',
          productCount: 567,
          matchScore: 80,
          trending: true,
          subcategories: ['Baby Clothes', 'Toys & Games', 'Baby Care', 'Educational Toys'],
          popularProducts: [
            { name: 'Baby Clothing Set', price: 1500, rating: 4.7 },
            { name: 'Educational Toys', price: 2200, rating: 4.8 },
            { name: 'Baby Care Kit', price: 3500, rating: 4.6 }
          ],
          userInterest: 65,
          avgPrice: 2100,
          tags: ['baby', 'kids', 'care']
        }
      ];

      setTimeout(() => {
        setSmartCategories(categories);
        setLoading(false);
      }, 1000);
    };

    loadSmartCategories();
  }, [userId]);

  const sortCategories = (categories: SmartCategory[]) => {
    switch (sortBy) {
      case 'trending':
        return [...categories].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
      case 'interest':
        return [...categories].sort((a, b) => b.userInterest - a.userInterest);
      default:
        return [...categories].sort((a, b) => b.matchScore - a.matchScore);
    }
  };

  const CategoryGridCard = ({ category }: { category: SmartCategory }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
      <div className={cn('h-32 bg-gradient-to-br', category.gradient, 'relative')}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 left-4 text-4xl">{category.icon}</div>
        <div className="absolute top-4 right-4">
          {category.trending && (
            <Badge className="bg-white/20 text-white border-white/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="text-2xl font-bold">{category.matchScore}%</div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Brain className="h-3 w-3 mr-1" />
              Match
            </Badge>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Products</span>
            <span className="font-semibold">{category.productCount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Price</span>
            <span className="font-semibold">৳{category.avgPrice.toLocaleString()}</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Your Interest</span>
              <span className="font-semibold">{category.userInterest}%</span>
            </div>
            <Progress value={category.userInterest} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-1">
            {category.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full mt-4" variant="outline">
          <span>Explore Category</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const CategoryListCard = ({ category }: { category: SmartCategory }) => (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl',
            category.gradient
          )}>
            {category.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary">{category.matchScore}%</div>
                <p className="text-xs text-muted-foreground">Match Score</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm font-semibold">{category.productCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="text-sm font-semibold">৳{category.avgPrice.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Avg Price</div>
              </div>
              <div>
                <div className="text-sm font-semibold">{category.userInterest}%</div>
                <div className="text-xs text-muted-foreground">Interest</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {category.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {category.trending && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              
              <Button variant="outline" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-lg w-96"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedCategories = sortCategories(smartCategories);

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">স্মার্ট ক্যাটেগরি সুপারিশ</h1>
            <p className="text-muted-foreground">
              AI-powered category recommendations based on your preferences
            </p>
          </div>
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4,527</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2.4x</div>
                <div className="text-sm text-muted-foreground">Better Match</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="trending">Trending</option>
              <option value="interest">Your Interest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map((category) => (
            <CategoryGridCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <CategoryListCard key={category.id} category={category} />
          ))}
        </div>
      )}

      {/* Personalization Insights */}
      <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personalization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our AI analyzed your shopping behavior, cultural preferences, and location 
            to suggest these categories. The match scores are based on your past purchases, 
            browsing history, and similar user preferences.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Bangladesh Cultural Preferences</Badge>
            <Badge variant="outline">Price Range Optimization</Badge>
            <Badge variant="outline">Seasonal Adjustments</Badge>
            <Badge variant="outline">Social Trends Integration</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryRecommendations;