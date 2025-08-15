/**
 * Phase 3: Appeal Stage - Urgency Signals
 * Amazon.com 5 A's Framework Implementation
 * Limited Time Offers, Stock Alerts, and Psychological Triggers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Clock, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Eye,
  Heart,
  Gift,
  Star,
  Timer,
  Flame,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgencySignalsProps {
  productId?: string;
  className?: string;
}

interface UrgencyData {
  flashSale: FlashSaleData | null;
  stockAlert: StockAlertData;
  demandIndicators: DemandIndicator[];
  timeBasedOffers: TimeBasedOffer[];
  socialPressure: SocialPressureData;
  limitedOffers: LimitedOffer[];
  countdownTimers: CountdownTimer[];
}

interface FlashSaleData {
  active: boolean;
  originalPrice: number;
  salePrice: number;
  discount: number;
  endsAt: string;
  unitsLeft: number;
  totalUnits: number;
  nextSaleAt?: string;
}

interface StockAlertData {
  level: 'high' | 'medium' | 'low' | 'critical';
  unitsLeft: number;
  threshold: number;
  message: string;
  color: string;
  urgencyScore: number;
}

interface DemandIndicator {
  id: string;
  type: 'views' | 'purchases' | 'wishlist' | 'cart';
  value: number;
  timeframe: string;
  message: string;
  icon: any;
  color: string;
}

interface TimeBasedOffer {
  id: string;
  title: string;
  description: string;
  endsAt: string;
  progress: number;
  savings: number;
  active: boolean;
}

interface SocialPressureData {
  currentViewers: number;
  recentPurchases: RecentPurchase[];
  popularityScore: number;
  trendingRank: number;
}

interface RecentPurchase {
  id: string;
  location: string;
  timeAgo: string;
  verified: boolean;
}

interface LimitedOffer {
  id: string;
  title: string;
  description: string;
  availableUntil: string;
  claimedCount: number;
  totalCount: number;
  offerType: 'quantity' | 'time' | 'membership';
  value: number;
}

interface CountdownTimer {
  id: string;
  label: string;
  endsAt: string;
  type: 'sale' | 'shipping' | 'offer' | 'availability';
  urgency: 'high' | 'medium' | 'low';
}

const UrgencySignals: React.FC<UrgencySignalsProps> = ({
  productId,
  className,
}) => {
  const [urgencyData, setUrgencyData] = useState<UrgencyData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update current time every second for countdown timers
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate urgency data loading
    const loadUrgencyData = () => {
      const now = new Date();
      const mockData: UrgencyData = {
        flashSale: {
          active: true,
          originalPrice: 18000,
          salePrice: 12500,
          discount: 31,
          endsAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
          unitsLeft: 23,
          totalUnits: 100,
          nextSaleAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        stockAlert: {
          level: 'low',
          unitsLeft: 8,
          threshold: 10,
          message: 'Only 8 left in stock - order soon!',
          color: 'text-orange-600',
          urgencyScore: 85
        },
        demandIndicators: [
          {
            id: 'views',
            type: 'views',
            value: 247,
            timeframe: 'last hour',
            message: '247 people viewed this in the last hour',
            icon: Eye,
            color: 'text-blue-600'
          },
          {
            id: 'purchases',
            type: 'purchases',
            value: 12,
            timeframe: 'today',
            message: '12 customers bought this today',
            icon: ShoppingCart,
            color: 'text-green-600'
          },
          {
            id: 'wishlist',
            type: 'wishlist',
            value: 89,
            timeframe: 'this week',
            message: '89 people added this to wishlist this week',
            icon: Heart,
            color: 'text-red-600'
          }
        ],
        timeBasedOffers: [
          {
            id: 'early-bird',
            title: 'Early Bird Special',
            description: 'Extra 10% off for next 2 hours',
            endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            progress: 65,
            savings: 1250,
            active: true
          },
          {
            id: 'midnight-deal',
            title: 'Midnight Flash Deal',
            description: 'Starts at midnight - be ready!',
            endsAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            progress: 0,
            savings: 2500,
            active: false
          }
        ],
        socialPressure: {
          currentViewers: 24,
          popularityScore: 94,
          trendingRank: 3,
          recentPurchases: [
            {
              id: '1',
              location: 'Dhaka',
              timeAgo: '2 minutes ago',
              verified: true
            },
            {
              id: '2',
              location: 'Chittagong',
              timeAgo: '7 minutes ago',
              verified: true
            },
            {
              id: '3',
              location: 'Sylhet',
              timeAgo: '12 minutes ago',
              verified: false
            }
          ]
        },
        limitedOffers: [
          {
            id: 'bundle',
            title: 'Bundle Discount',
            description: 'Buy with accessories and save ৳3,000',
            availableUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            claimedCount: 67,
            totalCount: 100,
            offerType: 'quantity',
            value: 3000
          },
          {
            id: 'first-time',
            title: 'First-Time Buyer Bonus',
            description: 'Additional ৳1,500 off your first purchase',
            availableUntil: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
            claimedCount: 234,
            totalCount: 500,
            offerType: 'membership',
            value: 1500
          }
        ],
        countdownTimers: [
          {
            id: 'flash-sale',
            label: 'Flash Sale Ends',
            endsAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
            type: 'sale',
            urgency: 'high'
          },
          {
            id: 'free-shipping',
            label: 'Free Shipping Cutoff',
            endsAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
            type: 'shipping',
            urgency: 'medium'
          }
        ]
      };

      setTimeout(() => {
        setUrgencyData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadUrgencyData();
  }, [productId]);

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const diff = end.getTime() - currentTime.getTime();
    
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const CountdownDisplay = ({ timer }: { timer: CountdownTimer }) => {
    const timeLeft = formatTimeRemaining(timer.endsAt);
    const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
    
    return (
      <div className={cn(
        'text-center p-4 rounded-lg border-2',
        timer.urgency === 'high' && 'border-red-500 bg-red-50',
        timer.urgency === 'medium' && 'border-orange-500 bg-orange-50',
        timer.urgency === 'low' && 'border-blue-500 bg-blue-50'
      )}>
        <div className="text-sm font-medium mb-2">{timer.label}</div>
        {!isExpired ? (
          <div className="flex justify-center gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Min</div>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Sec</div>
            </div>
          </div>
        ) : (
          <div className="text-lg font-bold text-red-600">EXPIRED</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!urgencyData) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Urgency Data</h3>
            <p className="text-muted-foreground">
              Urgency signals are not available for this product.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          Limited Time Offers & Urgency Alerts
        </h1>
        <p className="text-muted-foreground">
          Don't miss out on these exclusive deals and limited availability
        </p>
      </div>

      {/* Flash Sale Banner */}
      {urgencyData.flashSale?.active && (
        <Card className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-6 w-6" />
                  <span className="text-xl font-bold">FLASH SALE ACTIVE!</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  ৳{urgencyData.flashSale.salePrice.toLocaleString()}
                  <span className="text-lg ml-2 line-through opacity-75">
                    ৳{urgencyData.flashSale.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-lg">Save ৳{(urgencyData.flashSale.originalPrice - urgencyData.flashSale.salePrice).toLocaleString()} ({urgencyData.flashSale.discount}% OFF)</div>
              </div>
              <div className="text-center">
                <CountdownDisplay timer={{
                  id: 'flash',
                  label: 'Sale Ends In',
                  endsAt: urgencyData.flashSale.endsAt,
                  type: 'sale',
                  urgency: 'high'
                }} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Sale Progress</span>
                <span>{urgencyData.flashSale.unitsLeft} of {urgencyData.flashSale.totalUnits} left</span>
              </div>
              <Progress 
                value={((urgencyData.flashSale.totalUnits - urgencyData.flashSale.unitsLeft) / urgencyData.flashSale.totalUnits) * 100} 
                className="h-3 bg-white/20"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Alert */}
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn('h-6 w-6', urgencyData.stockAlert.color)} />
            <div className="flex-1">
              <div className="font-semibold">{urgencyData.stockAlert.message}</div>
              <div className="text-sm text-muted-foreground">
                Stock level: {urgencyData.stockAlert.level} | Urgency Score: {urgencyData.stockAlert.urgencyScore}%
              </div>
            </div>
            <Badge variant="outline" className={cn('font-bold', urgencyData.stockAlert.color)}>
              {urgencyData.stockAlert.unitsLeft} left
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Countdown Timers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {urgencyData.countdownTimers.map((timer) => (
          <CountdownDisplay key={timer.id} timer={timer} />
        ))}
      </div>

      {/* Demand Indicators */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real-Time Demand Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgencyData.demandIndicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <div key={indicator.id} className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon className={cn('h-8 w-8 mx-auto mb-2', indicator.color)} />
                  <div className="text-2xl font-bold">{indicator.value}</div>
                  <div className="text-sm text-muted-foreground">{indicator.message}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Social Pressure */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{urgencyData.socialPressure.currentViewers}</div>
                  <div className="text-sm text-muted-foreground">Currently Viewing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">#{urgencyData.socialPressure.trendingRank}</div>
                  <div className="text-sm text-muted-foreground">Trending Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{urgencyData.socialPressure.popularityScore}%</div>
                  <div className="text-sm text-muted-foreground">Popularity</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Recent Purchases</h4>
              <div className="space-y-2">
                {urgencyData.socialPressure.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Customer from <strong>{purchase.location}</strong> purchased {purchase.timeAgo}</span>
                    {purchase.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limited Offers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Limited Time Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgencyData.limitedOffers.map((offer) => (
              <div key={offer.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{offer.title}</h4>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    Save ৳{offer.value.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{offer.claimedCount}</span> of <span className="font-medium">{offer.totalCount}</span> claimed
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ends: {formatTimeRemaining(offer.availableUntil).hours}h {formatTimeRemaining(offer.availableUntil).minutes}m
                  </div>
                </div>
                
                <Progress 
                  value={(offer.claimedCount / offer.totalCount) * 100} 
                  className="mt-2 h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time-Based Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Upcoming Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgencyData.timeBasedOffers.map((offer) => (
              <div key={offer.id} className={cn(
                'p-4 rounded-lg border',
                offer.active ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{offer.title}</h4>
                  <Badge variant={offer.active ? 'default' : 'secondary'}>
                    {offer.active ? 'ACTIVE' : 'COMING SOON'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>
                <div className="text-sm font-medium text-green-600">
                  Save ৳{offer.savings.toLocaleString()}
                </div>
                {offer.active && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Ends in: {formatTimeRemaining(offer.endsAt).hours}h {formatTimeRemaining(offer.endsAt).minutes}m
                    </div>
                    <Progress value={offer.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrgencySignals;