/**
 * Phase 3: Aware Stage - Trending Explorer
 * Amazon.com 5 A's Framework Implementation
 * Advanced Trending Analysis with Real-time Data
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Fire, 
  Clock, 
  Users, 
  Star,
  ArrowUp,
  ArrowDown,
  Zap,
  Globe,
  MapPin,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingExplorerProps {
  className?: string;
}

interface TrendingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  trendScore: number;
  changePercentage: number;
  timeframe: string;
  location?: string;
  tags: string[];
}

interface TrendingCategory {
  id: string;
  name: string;
  icon: any;
  growth: number;
  itemCount: number;
  color: string;
}

const TrendingExplorer: React.FC<TrendingExplorerProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time trending data
    const loadTrendingData = () => {
      const mockTrendingItems: TrendingItem[] = [
        {
          id: '1',
          name: 'Wireless Gaming Headset',
          category: 'Electronics',
          price: 6500,
          image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=200',
          rating: 4.7,
          trendScore: 98,
          changePercentage: 45,
          timeframe: '24h',
          location: 'Dhaka',
          tags: ['gaming', 'wireless', 'bestseller']
        },
        {
          id: '2',
          name: 'Summer Fashion Collection',
          category: 'Fashion',
          price: 2800,
          image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200',
          rating: 4.5,
          trendScore: 94,
          changePercentage: 38,
          timeframe: '24h',
          location: 'Bangladesh',
          tags: ['summer', 'trending', 'fashion']
        },
        {
          id: '3',
          name: 'Smart Fitness Tracker',
          category: 'Health & Fitness',
          price: 4200,
          image: 'https://images.unsplash.com/photo-1611472173362-3f4d9d9b1a7b?w=200',
          rating: 4.6,
          trendScore: 91,
          changePercentage: 32,
          timeframe: '24h',
          location: 'Chittagong',
          tags: ['fitness', 'smart', 'health']
        },
        {
          id: '4',
          name: 'Bengali Cookbook Collection',
          category: 'Books',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200',
          rating: 4.8,
          trendScore: 88,
          changePercentage: 28,
          timeframe: '24h',
          location: 'Sylhet',
          tags: ['bengali', 'cooking', 'cultural']
        },
        {
          id: '5',
          name: 'Premium Smartphone Case',
          category: 'Accessories',
          price: 1200,
          image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=200',
          rating: 4.4,
          trendScore: 85,
          changePercentage: 25,
          timeframe: '24h',
          location: 'Khulna',
          tags: ['phone', 'protection', 'premium']
        }
      ];

      const mockTrendingCategories: TrendingCategory[] = [
        {
          id: 'electronics',
          name: 'Electronics',
          icon: Zap,
          growth: 42,
          itemCount: 1247,
          color: 'bg-blue-500'
        },
        {
          id: 'fashion',
          name: 'Fashion & Beauty',
          icon: Star,
          growth: 35,
          itemCount: 856,
          color: 'bg-pink-500'
        },
        {
          id: 'health',
          name: 'Health & Fitness',
          icon: TrendingUp,
          growth: 28,
          itemCount: 423,
          color: 'bg-green-500'
        },
        {
          id: 'books',
          name: 'Books & Education',
          icon: BarChart3,
          growth: 22,
          itemCount: 634,
          color: 'bg-purple-500'
        }
      ];

      setTimeout(() => {
        setTrendingItems(mockTrendingItems);
        setTrendingCategories(mockTrendingCategories);
        setLoading(false);
      }, 1000);
    };

    loadTrendingData();
  }, []);

  const TrendingCard = ({ item }: { item: TrendingItem }) => (
    <Card className="group hover:shadow-lg transition-all cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-xs bg-red-500 text-white"
            >
              <Fire className="h-3 w-3 mr-1" />
              {item.trendScore}
            </Badge>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  ৳{item.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs">{item.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs flex items-center gap-1',
                    item.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {item.changePercentage > 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(item.changePercentage)}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.timeframe}
                </Badge>
              </div>
              
              {item.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </Badge>
              )}
            </div>

            <div className="flex gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: TrendingCategory }) => {
    const Icon = category.icon;
    return (
      <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              category.color
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.itemCount} trending items
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">{category.growth}%</span>
              </div>
              <p className="text-xs text-muted-foreground">growth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-lg w-96"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Fire className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">ট্রেন্ডিং এক্সপ্লোরার</h1>
            <p className="text-muted-foreground">
              Real-time trending analysis across Bangladesh
            </p>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">2.4M</div>
              <div className="text-sm text-muted-foreground">Active Searches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">+32%</div>
              <div className="text-sm text-muted-foreground">Avg Growth</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-muted-foreground">Hot Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">64</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trending Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">রিয়েল-টাইম ট্রেন্ডিং</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Updates
              </Badge>
            </div>
            
            <div className="space-y-4">
              {trendingItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <TrendingCard item={item} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">আজকের সেরা ট্রেন্ডিং</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trendingItems.slice(0, 4).map((item) => (
                <TrendingCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">সাপ্তাহিক ট্রেন্ডিং</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trendingItems.map((item) => (
                <TrendingCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">ট্রেন্ডিং ক্যাটেগরি</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Regional Insights */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Trending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Dhaka Trends</h4>
              <p className="text-sm text-muted-foreground">Electronics +45%, Fashion +38%</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Chittagong Trends</h4>
              <p className="text-sm text-muted-foreground">Health +32%, Books +28%</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sylhet Trends</h4>
              <p className="text-sm text-muted-foreground">Cultural +25%, Home +22%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingExplorer;