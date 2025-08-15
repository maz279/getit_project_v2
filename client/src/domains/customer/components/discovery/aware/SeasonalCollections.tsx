/**
 * Phase 3: Aware Stage - Seasonal Collections
 * Amazon.com 5 A's Framework Implementation
 * Festival Collections with Bangladesh Seasonal Context
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Calendar, 
  Clock, 
  Star, 
  Gift, 
  Sparkles, 
  Sun,
  CloudRain,
  Snowflake,
  Flower,
  Heart,
  Crown,
  Moon,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeasonalCollectionsProps {
  className?: string;
}

interface SeasonalCollection {
  id: string;
  title: string;
  titleEn: string;
  season: string;
  description: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  progress: number;
  color: string;
  gradient: string;
  icon: any;
  featured: boolean;
  products: SeasonalProduct[];
  culturalSignificance: string;
  weatherContext: string;
}

interface SeasonalProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  discount?: number;
  limited: boolean;
  festive: boolean;
  seasonal: boolean;
}

const SeasonalCollections: React.FC<SeasonalCollectionsProps> = ({ className }) => {
  const [collections, setCollections] = useState<SeasonalCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load seasonal collections based on current time and cultural calendar
    const loadSeasonalData = () => {
      const seasonalData: SeasonalCollection[] = [
        {
          id: 'winter-fest',
          title: 'শীতকালীন উৎসব সংগ্রহ',
          titleEn: 'Winter Festival Collection',
          season: 'Winter',
          description: 'Warm clothing and cozy items for Bangladesh winter',
          startDate: '2024-12-01',
          endDate: '2025-02-28',
          daysRemaining: 45,
          progress: 65,
          color: 'bg-blue-500',
          gradient: 'from-blue-500 to-purple-600',
          icon: Snowflake,
          featured: true,
          culturalSignificance: 'Winter in Bangladesh brings comfortable weather and festival season',
          weatherContext: 'Cool and pleasant weather perfect for outdoor activities',
          products: [
            {
              id: 'w1',
              name: 'Winter Jacket Collection',
              price: 4500,
              originalPrice: 6000,
              image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300',
              rating: 4.7,
              discount: 25,
              limited: true,
              festive: false,
              seasonal: true
            },
            {
              id: 'w2',
              name: 'Warm Blanket Set',
              price: 2800,
              originalPrice: 3500,
              image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
              rating: 4.6,
              discount: 20,
              limited: false,
              festive: false,
              seasonal: true
            }
          ]
        },
        {
          id: 'summer-collection',
          title: 'গ্রীষ্মকালীন সংগ্রহ',
          titleEn: 'Summer Collection',
          season: 'Summer',
          description: 'Cool and comfortable items for hot summer days',
          startDate: '2025-03-01',
          endDate: '2025-06-30',
          daysRemaining: 125,
          progress: 15,
          color: 'bg-orange-500',
          gradient: 'from-orange-500 to-red-600',
          icon: Sun,
          featured: false,
          culturalSignificance: 'Summer season with mangoes and traditional cooling items',
          weatherContext: 'Hot and humid weather requiring cooling solutions',
          products: [
            {
              id: 's1',
              name: 'Cotton Summer Dress',
              price: 1800,
              originalPrice: 2500,
              image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
              rating: 4.5,
              discount: 28,
              limited: false,
              festive: false,
              seasonal: true
            },
            {
              id: 's2',
              name: 'Cooling Appliances',
              price: 25000,
              originalPrice: 32000,
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
              rating: 4.8,
              discount: 22,
              limited: true,
              festive: false,
              seasonal: true
            }
          ]
        },
        {
          id: 'monsoon-essentials',
          title: 'বর্ষাকালীন প্রয়োজনীয়',
          titleEn: 'Monsoon Essentials',
          season: 'Monsoon',
          description: 'Rainy season essentials for Bangladesh monsoon',
          startDate: '2025-06-01',
          endDate: '2025-09-30',
          daysRemaining: 185,
          progress: 5,
          color: 'bg-teal-500',
          gradient: 'from-teal-500 to-blue-600',
          icon: CloudRain,
          featured: false,
          culturalSignificance: 'Monsoon brings relief from heat and cultural festivities',
          weatherContext: 'Heavy rainfall requiring waterproof and quick-dry items',
          products: [
            {
              id: 'm1',
              name: 'Waterproof Rain Gear',
              price: 1200,
              originalPrice: 1800,
              image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300',
              rating: 4.4,
              discount: 33,
              limited: false,
              festive: false,
              seasonal: true
            }
          ]
        },
        {
          id: 'eid-countdown',
          title: 'ঈদ কাউন্টডাউন',
          titleEn: 'Eid Countdown',
          season: 'Festival',
          description: 'Special Eid preparation collection',
          startDate: '2025-01-01',
          endDate: '2025-03-30',
          daysRemaining: 30,
          progress: 80,
          color: 'bg-green-500',
          gradient: 'from-green-500 to-emerald-600',
          icon: Crown,
          featured: true,
          culturalSignificance: 'Most important Islamic festival celebrated across Bangladesh',
          weatherContext: 'Pleasant spring weather perfect for celebrations',
          products: [
            {
              id: 'e1',
              name: 'Eid Special Panjabi',
              price: 3500,
              originalPrice: 5000,
              image: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=300',
              rating: 4.9,
              discount: 30,
              limited: true,
              festive: true,
              seasonal: false
            },
            {
              id: 'e2',
              name: 'Kids Eid Outfit',
              price: 1800,
              originalPrice: 2500,
              image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300',
              rating: 4.8,
              discount: 28,
              limited: true,
              festive: true,
              seasonal: false
            }
          ]
        },
        {
          id: 'pohela-boishakh-prep',
          title: 'পহেলা বৈশাখ প্রস্তুতি',
          titleEn: 'Pohela Boishakh Preparation',
          season: 'Spring',
          description: 'Bengali New Year celebration essentials',
          startDate: '2025-03-01',
          endDate: '2025-04-14',
          daysRemaining: 75,
          progress: 40,
          color: 'bg-red-500',
          gradient: 'from-red-500 to-pink-600',
          icon: Heart,
          featured: true,
          culturalSignificance: 'Traditional Bengali New Year marking spring season',
          weatherContext: 'Pleasant spring weather with blooming flowers',
          products: [
            {
              id: 'pb1',
              name: 'Traditional Red Saree',
              price: 4500,
              originalPrice: 6000,
              image: 'https://images.unsplash.com/photo-1610030469036-12993ce8c2c2?w=300',
              rating: 4.9,
              discount: 25,
              limited: true,
              festive: true,
              seasonal: false
            },
            {
              id: 'pb2',
              name: 'White Kurta Set',
              price: 2200,
              originalPrice: 3000,
              image: 'https://images.unsplash.com/photo-1506629905042-87f36601c674?w=300',
              rating: 4.7,
              discount: 27,
              limited: false,
              festive: true,
              seasonal: false
            }
          ]
        },
        {
          id: 'victory-day',
          title: 'বিজয় দিবস সংগ্রহ',
          titleEn: 'Victory Day Collection',
          season: 'Winter',
          description: 'Patriotic collection for Victory Day celebration',
          startDate: '2024-12-01',
          endDate: '2024-12-16',
          daysRemaining: 12,
          progress: 95,
          color: 'bg-green-600',
          gradient: 'from-green-600 to-red-600',
          icon: Star,
          featured: false,
          culturalSignificance: 'Celebrating Bangladesh independence and national pride',
          weatherContext: 'Cool winter weather for outdoor patriotic events',
          products: [
            {
              id: 'vd1',
              name: 'Bangladesh Flag Theme Shirt',
              price: 1200,
              originalPrice: 1800,
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
              rating: 4.6,
              discount: 33,
              limited: true,
              festive: true,
              seasonal: false
            }
          ]
        }
      ];

      setTimeout(() => {
        setCollections(seasonalData);
        setLoading(false);
      }, 1000);
    };

    loadSeasonalData();
  }, []);

  const CollectionCard = ({ collection }: { collection: SeasonalCollection }) => {
    const Icon = collection.icon;
    return (
      <Card className={cn(
        'group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden',
        collection.featured && 'ring-2 ring-primary ring-opacity-50'
      )}>
        <div className={cn('h-32 bg-gradient-to-br', collection.gradient, 'relative')}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-4 left-4">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-4 right-4">
            {collection.featured && (
              <Badge className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-white">
              <div className="text-sm opacity-90">{collection.season}</div>
              <div className="text-lg font-bold">{collection.title}</div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              {collection.description}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {collection.culturalSignificance}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {collection.daysRemaining} days remaining
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {collection.season}
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Season Progress</span>
                <span className="font-semibold">{collection.progress}%</span>
              </div>
              <Progress value={collection.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold">{collection.products.length}</div>
                <div className="text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="font-semibold">
                  {collection.products.filter(p => p.discount).length}
                </div>
                <div className="text-muted-foreground">On Sale</div>
              </div>
              <div>
                <div className="font-semibold">
                  {collection.products.filter(p => p.limited).length}
                </div>
                <div className="text-muted-foreground">Limited</div>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4" variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Explore Collection
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ProductCard = ({ product }: { product: SeasonalProduct }) => (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
        />
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            {product.discount}% OFF
          </Badge>
        )}
        {product.limited && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Limited
          </Badge>
        )}
        {product.festive && (
          <Badge className="absolute bottom-2 left-2 bg-purple-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Festive
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>

        <div className="flex gap-1">
          {product.seasonal && (
            <Badge variant="secondary" className="text-xs">Seasonal</Badge>
          )}
          {product.festive && (
            <Badge variant="secondary" className="text-xs">Festive</Badge>
          )}
          {product.limited && (
            <Badge variant="outline" className="text-xs">Limited</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-lg w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featuredCollections = collections.filter(c => c.featured);
  const upcomingCollections = collections.filter(c => c.daysRemaining > 30);
  const currentCollections = collections.filter(c => c.daysRemaining <= 30 && c.daysRemaining > 0);

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">মৌসুমী সংগ্রহ</h1>
            <p className="text-muted-foreground">
              Seasonal collections celebrating Bangladesh's cultural calendar
            </p>
          </div>
        </div>

        {/* Current Season Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">Winter</div>
                <div className="text-sm text-muted-foreground">Current Season</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">18°C</div>
                <div className="text-sm text-muted-foreground">Perfect Weather</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">6</div>
                <div className="text-sm text-muted-foreground">Active Collections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">45%</div>
                <div className="text-sm text-muted-foreground">Avg Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Collections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">বিশেষ নির্বাচিত সংগ্রহ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>

      {/* Current Active Collections */}
      {currentCollections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            এখনই সক্রিয় সংগ্রহ
            <Badge className="ml-2 bg-red-500 text-white">
              <Clock className="h-3 w-3 mr-1" />
              Ending Soon
            </Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">বিশেষ নির্বাচিত পণ্য</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {collections
            .flatMap(c => c.products)
            .filter(p => p.limited || p.festive)
            .slice(0, 10)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>

      {/* Upcoming Collections */}
      {upcomingCollections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">আসছে শীঘ্রই</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}

      {/* Cultural Calendar */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Bangladesh Cultural Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our seasonal collections are carefully curated based on Bangladesh's cultural 
            calendar, weather patterns, and traditional celebrations. We ensure you're 
            always prepared for upcoming festivals and seasonal changes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Eid Festivals</div>
              <div className="text-sm text-muted-foreground">2 per year</div>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="font-semibold">Pohela Boishakh</div>
              <div className="text-sm text-muted-foreground">April 14</div>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Victory Day</div>
              <div className="text-sm text-muted-foreground">December 16</div>
            </div>
            <div className="text-center">
              <Flower className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Spring Season</div>
              <div className="text-sm text-muted-foreground">Mar-May</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalCollections;