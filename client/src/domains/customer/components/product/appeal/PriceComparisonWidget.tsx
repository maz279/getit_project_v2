/**
 * Phase 3: Appeal Stage - Price Comparison Widget
 * Amazon.com 5 A's Framework Implementation
 * Price Intelligence with Competitor Analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  TrendingDown, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Shield,
  Truck,
  Award,
  Target,
  Eye,
  ThumbsUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceComparisonWidgetProps {
  productId?: string;
  className?: string;
}

interface PriceComparison {
  currentStore: StoreOffer;
  competitors: StoreOffer[];
  priceHistory: PriceHistoryPoint[];
  marketAnalysis: MarketAnalysis;
  dealAlerts: DealAlert[];
  savingsOpportunities: SavingsOpportunity[];
}

interface StoreOffer {
  storeId: string;
  storeName: string;
  logo: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  rating: number;
  shippingCost: number;
  shippingTime: string;
  warranty: string;
  returnPolicy: string;
  verified: boolean;
  features: string[];
  badges: string[];
  totalPrice: number;
}

interface PriceHistoryPoint {
  date: string;
  price: number;
  store: string;
}

interface MarketAnalysis {
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  pricePosition: 'lowest' | 'below-average' | 'average' | 'above-average' | 'highest';
  marketScore: number;
  recommendation: string;
}

interface DealAlert {
  id: string;
  type: 'price-drop' | 'better-deal' | 'stock-alert' | 'coupon';
  message: string;
  savings: number;
  urgency: 'high' | 'medium' | 'low';
  actionText: string;
}

interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  potential: number;
  effort: 'easy' | 'medium' | 'hard';
  category: 'coupon' | 'bundle' | 'timing' | 'store-switch';
}

const PriceComparisonWidget: React.FC<PriceComparisonWidgetProps> = ({
  productId,
  className,
}) => {
  const [priceData, setPriceData] = useState<PriceComparison | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate price comparison data loading
    const loadPriceData = () => {
      const mockData: PriceComparison = {
        currentStore: {
          storeId: 'getit',
          storeName: 'GetIt Bangladesh',
          logo: '🛒',
          price: 12500,
          originalPrice: 18000,
          discount: 31,
          inStock: true,
          rating: 4.8,
          shippingCost: 0,
          shippingTime: '24 hours',
          warranty: '2 years',
          returnPolicy: '30 days',
          verified: true,
          features: ['Free Shipping', 'Express Delivery', 'Official Warranty'],
          badges: ['Best Price', 'Verified Seller', 'Fast Shipping'],
          totalPrice: 12500
        },
        competitors: [
          {
            storeId: 'techshop',
            storeName: 'TechShop BD',
            logo: '💻',
            price: 13200,
            originalPrice: 17500,
            discount: 25,
            inStock: true,
            rating: 4.6,
            shippingCost: 100,
            shippingTime: '2-3 days',
            warranty: '1 year',
            returnPolicy: '15 days',
            verified: true,
            features: ['Warranty Included'],
            badges: ['Verified'],
            totalPrice: 13300
          },
          {
            storeId: 'electromart',
            storeName: 'ElectroMart',
            logo: '⚡',
            price: 14500,
            originalPrice: 19000,
            discount: 24,
            inStock: false,
            rating: 4.4,
            shippingCost: 150,
            shippingTime: '3-5 days',
            warranty: '1 year',
            returnPolicy: '7 days',
            verified: false,
            features: [],
            badges: [],
            totalPrice: 14650
          },
          {
            storeId: 'gadgetworld',
            storeName: 'Gadget World',
            logo: '📱',
            price: 12800,
            originalPrice: 16500,
            discount: 22,
            inStock: true,
            rating: 4.2,
            shippingCost: 200,
            shippingTime: '2-4 days',
            warranty: '6 months',
            returnPolicy: '10 days',
            verified: true,
            features: ['Local Warranty'],
            badges: ['Quick Delivery'],
            totalPrice: 13000
          }
        ],
        priceHistory: [
          { date: '2024-12-01', price: 15000, store: 'GetIt' },
          { date: '2024-12-05', price: 14500, store: 'GetIt' },
          { date: '2024-12-10', price: 13800, store: 'GetIt' },
          { date: '2024-12-15', price: 13200, store: 'GetIt' },
          { date: '2024-12-20', price: 12500, store: 'GetIt' }
        ],
        marketAnalysis: {
          lowestPrice: 12500,
          highestPrice: 14500,
          averagePrice: 13250,
          pricePosition: 'lowest',
          marketScore: 95,
          recommendation: 'Excellent deal! This is the best price available across all stores.'
        },
        dealAlerts: [
          {
            id: 'price-leader',
            type: 'better-deal',
            message: 'You\'re getting the best price! ৳700 cheaper than competitors',
            savings: 700,
            urgency: 'high',
            actionText: 'Buy Now'
          },
          {
            id: 'limited-stock',
            type: 'stock-alert',
            message: 'Only 8 units left at this price',
            savings: 0,
            urgency: 'medium',
            actionText: 'Reserve Now'
          }
        ],
        savingsOpportunities: [
          {
            id: 'bundle',
            title: 'Bundle with Accessories',
            description: 'Add gaming mouse and save additional ৳500',
            potential: 500,
            effort: 'easy',
            category: 'bundle'
          },
          {
            id: 'coupon',
            title: 'First-Time Buyer Coupon',
            description: 'Apply WELCOME10 for extra 10% off',
            potential: 1250,
            effort: 'easy',
            category: 'coupon'
          },
          {
            id: 'timing',
            title: 'Midnight Flash Sale',
            description: 'Wait for midnight sale for potential extra savings',
            potential: 800,
            effort: 'medium',
            category: 'timing'
          }
        ]
      };

      setTimeout(() => {
        setPriceData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadPriceData();
  }, [productId]);

  const getPriceStatusColor = (position: string) => {
    switch (position) {
      case 'lowest': return 'text-green-600';
      case 'below-average': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'above-average': return 'text-orange-600';
      case 'highest': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const StoreCard = ({ store, isCurrent = false }: { store: StoreOffer; isCurrent?: boolean }) => (
    <Card className={cn(
      'relative transition-all hover:shadow-lg',
      isCurrent && 'ring-2 ring-primary bg-primary/5'
    )}>
      {isCurrent && (
        <Badge className="absolute -top-2 left-4 bg-primary text-white">
          <Crown className="h-3 w-3 mr-1" />
          Your Store
        </Badge>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{store.logo}</span>
            <div>
              <h3 className="font-semibold text-sm">{store.storeName}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs">{store.rating}</span>
                {store.verified && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </div>
            </div>
          </div>
          
          {!store.inStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              ৳{store.price.toLocaleString()}
            </span>
            {store.originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ৳{store.originalPrice.toLocaleString()}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {store.discount}% OFF
                </Badge>
              </>
            )}
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className={store.shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                {store.shippingCost === 0 ? 'FREE' : `৳${store.shippingCost}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{store.shippingTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Warranty:</span>
              <span>{store.warranty}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total:</span>
              <span>৳{store.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {store.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {store.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {store.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {store.badges.map((badge) => (
                <Badge key={badge} className="text-xs bg-blue-100 text-blue-700">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <Button 
            className="w-full mt-3" 
            size="sm"
            disabled={!store.inStock}
            variant={isCurrent ? 'default' : 'outline'}
          >
            {store.inStock ? (isCurrent ? 'Buy Now' : 'Visit Store') : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Price Data Unavailable</h3>
            <p className="text-muted-foreground">
              Price comparison information is not available for this product.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allStores = [priceData.currentStore, ...priceData.competitors];
  const sortedStores = allStores.sort((a, b) => a.totalPrice - b.totalPrice);

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-500" />
          Smart Price Comparison
        </h1>
        <p className="text-muted-foreground">
          Compare prices across stores and find the best deals
        </p>
      </div>

      {/* Deal Alerts */}
      {priceData.dealAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {priceData.dealAlerts.map((alert) => (
            <Card key={alert.id} className={cn(
              'border-l-4',
              alert.urgency === 'high' && 'border-l-red-500 bg-red-50',
              alert.urgency === 'medium' && 'border-l-orange-500 bg-orange-50',
              alert.urgency === 'low' && 'border-l-blue-500 bg-blue-50'
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {alert.type === 'better-deal' && <TrendingDown className="h-5 w-5 text-green-600" />}
                    {alert.type === 'stock-alert' && <AlertCircle className="h-5 w-5 text-orange-600" />}
                    {alert.type === 'price-drop' && <TrendingDown className="h-5 w-5 text-blue-600" />}
                    <div>
                      <p className="font-semibold">{alert.message}</p>
                      {alert.savings > 0 && (
                        <p className="text-sm text-green-600">
                          Save ৳{alert.savings.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    {alert.actionText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Market Analysis */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ৳{priceData.marketAnalysis.lowestPrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Lowest Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ৳{priceData.marketAnalysis.averagePrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Average Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ৳{priceData.marketAnalysis.highestPrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Highest Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {priceData.marketAnalysis.marketScore}%
              </div>
              <div className="text-sm text-muted-foreground">Market Score</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn(
              'text-white',
              priceData.marketAnalysis.pricePosition === 'lowest' && 'bg-green-600',
              priceData.marketAnalysis.pricePosition === 'below-average' && 'bg-blue-600',
              priceData.marketAnalysis.pricePosition === 'average' && 'bg-yellow-600',
              priceData.marketAnalysis.pricePosition === 'above-average' && 'bg-orange-600',
              priceData.marketAnalysis.pricePosition === 'highest' && 'bg-red-600'
            )}>
              {priceData.marketAnalysis.pricePosition.replace('-', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm font-medium">Position in Market</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {priceData.marketAnalysis.recommendation}
          </p>
        </CardContent>
      </Card>

      {/* Price Comparison Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Store Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedStores.map((store) => (
            <StoreCard 
              key={store.storeId} 
              store={store} 
              isCurrent={store.storeId === priceData.currentStore.storeId}
            />
          ))}
        </div>
      </div>

      {/* Savings Opportunities */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Additional Savings Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceData.savingsOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{opportunity.title}</h4>
                  <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.effort} effort
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ৳{opportunity.potential.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">potential savings</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            {priceData.priceHistory.map((point, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm">{point.date}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">৳{point.price.toLocaleString()}</span>
                  {index > 0 && (
                    <Badge variant={
                      point.price < priceData.priceHistory[index - 1].price ? 'default' : 'destructive'
                    } className="text-xs">
                      {point.price < priceData.priceHistory[index - 1].price ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(point.price - priceData.priceHistory[index - 1].price)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceComparisonWidget;