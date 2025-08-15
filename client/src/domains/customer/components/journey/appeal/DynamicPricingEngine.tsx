/**
 * Dynamic Pricing Engine - Amazon.com APPEAL Stage
 * Real-time pricing with social proof and urgency indicators
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Progress } from '../../../shared/ui/progress';
import { cn } from '../../../../lib/utils';

interface PricingData {
  basePrice: number;
  currentPrice: number;
  discountPercentage: number;
  priceHistory: { date: string; price: number }[];
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  stockLevel: number;
  totalStock: number;
  viewersCount: number;
  purchasedRecently: number;
  timeLeft?: number; // seconds for flash sales
}

interface DynamicPricingEngineProps {
  productId: string;
  className?: string;
  showSocialProof?: boolean;
  showUrgencyIndicators?: boolean;
  enableRealTimeUpdates?: boolean;
}

export default function DynamicPricingEngine({
  productId,
  className,
  showSocialProof = true,
  showUrgencyIndicators = true,
  enableRealTimeUpdates = true
}: DynamicPricingEngineProps) {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceAnimation, setPriceAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Sample pricing data - in production, this would come from pricing service
  useEffect(() => {
    const loadPricingData = () => {
      const sampleData: PricingData = {
        basePrice: 3500,
        currentPrice: 2450,
        discountPercentage: 30,
        priceHistory: [
          { date: '2025-07-01', price: 3500 },
          { date: '2025-07-05', price: 3200 },
          { date: '2025-07-10', price: 2800 },
          { date: '2025-07-13', price: 2450 }
        ],
        demandLevel: 'high',
        stockLevel: 12,
        totalStock: 50,
        viewersCount: 47,
        purchasedRecently: 8,
        timeLeft: 3600 // 1 hour flash sale
      };
      setPricingData(sampleData);
      setTimeLeft(sampleData.timeLeft || 0);
      setIsLoading(false);
    };

    loadPricingData();
  }, [productId]);

  // Real-time updates simulation
  useEffect(() => {
    if (!enableRealTimeUpdates || !pricingData) return;

    const interval = setInterval(() => {
      setPricingData(prev => {
        if (!prev) return null;
        
        // Simulate dynamic changes
        const viewerChange = Math.floor(Math.random() * 10) - 5; // ±5 viewers
        const newViewersCount = Math.max(0, prev.viewersCount + viewerChange);
        
        // Occasionally show price drops for urgency
        const shouldDropPrice = Math.random() < 0.1; // 10% chance
        const newPrice = shouldDropPrice 
          ? Math.max(prev.basePrice * 0.6, prev.currentPrice - 50)
          : prev.currentPrice;
        
        if (newPrice !== prev.currentPrice) {
          setPriceAnimation(true);
          setTimeout(() => setPriceAnimation(false), 1000);
        }

        return {
          ...prev,
          currentPrice: newPrice,
          discountPercentage: Math.round(((prev.basePrice - newPrice) / prev.basePrice) * 100),
          viewersCount: newViewersCount,
          purchasedRecently: prev.purchasedRecently + (Math.random() < 0.05 ? 1 : 0)
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, pricingData]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStockUrgency = () => {
    if (!pricingData) return null;
    const percentage = (pricingData.stockLevel / pricingData.totalStock) * 100;
    
    if (percentage <= 10) return { level: 'critical', message: 'Only few left!' };
    if (percentage <= 25) return { level: 'high', message: 'Running low!' };
    if (percentage <= 50) return { level: 'medium', message: 'Popular item' };
    return null;
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6 animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!pricingData) return null;

  const stockUrgency = getStockUrgency();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Pricing Card */}
      <Card className="p-6 border-l-4 border-l-orange-500">
        <div className="space-y-4">
          {/* Price Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span 
                className={cn(
                  "text-3xl font-bold text-gray-900 dark:text-gray-100 transition-all duration-500",
                  priceAnimation && "scale-110 text-red-500"
                )}
              >
                {formatPrice(pricingData.currentPrice)}
              </span>
              {pricingData.basePrice > pricingData.currentPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(pricingData.basePrice)}
                </span>
              )}
              {pricingData.discountPercentage > 0 && (
                <Badge className="bg-red-500 text-white font-bold">
                  {pricingData.discountPercentage}% OFF
                </Badge>
              )}
            </div>
            
            {pricingData.discountPercentage > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                You save {formatPrice(pricingData.basePrice - pricingData.currentPrice)}
              </p>
            )}
          </div>

          {/* Flash Sale Countdown */}
          {timeLeft > 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    ⚡ Flash Sale Ending Soon!
                  </p>
                  <p className="text-red-600 dark:text-red-300 text-sm">
                    Limited time offer
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Time left
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Demand Indicator */}
          <div className={cn(
            "p-3 rounded-lg border",
            getDemandColor(pricingData.demandLevel)
          )}>
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">
                {pricingData.demandLevel} Demand
              </span>
              <span className="text-sm">
                📈 {pricingData.demandLevel === 'critical' ? 'Very Hot!' : 
                     pricingData.demandLevel === 'high' ? 'Popular!' : 
                     pricingData.demandLevel === 'medium' ? 'Steady' : 'Available'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Proof Indicators */}
      {showSocialProof && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            What Others Are Doing
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                👀 Currently viewing
              </span>
              <span className="font-medium text-orange-600">
                {pricingData.viewersCount} people
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                🛒 Purchased recently
              </span>
              <span className="font-medium text-green-600">
                {pricingData.purchasedRecently} in last hour
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                📦 Stock level
              </span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(pricingData.stockLevel / pricingData.totalStock) * 100} 
                  className="w-16 h-2"
                />
                <span className="font-medium">
                  {pricingData.stockLevel}/{pricingData.totalStock}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Urgency Indicators */}
      {showUrgencyIndicators && stockUrgency && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">
                🚨 {stockUrgency.message}
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Only {pricingData.stockLevel} units remaining
              </p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Order Now
            </Button>
          </div>
        </Card>
      )}

      {/* Price History */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          📈 Price Trend
        </h4>
        <div className="space-y-2">
          {pricingData.priceHistory.slice(-3).map((entry, index) => (
            <div key={entry.date} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(entry.date).toLocaleDateString('en-BD')}
              </span>
              <span className={cn(
                "font-medium",
                entry.price === pricingData.currentPrice ? "text-green-600" : "text-gray-500"
              )}>
                {formatPrice(entry.price)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
          💰 Best price in 30 days!
        </div>
      </Card>

      {/* Call-to-Action */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Price may increase based on demand
          </p>
          <Button 
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
          >
            🛒 Add to Cart - {formatPrice(pricingData.currentPrice)}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ✅ Free delivery • 🔄 Easy returns • 🔒 Secure payment
          </p>
        </div>
      </Card>
    </div>
  );
}