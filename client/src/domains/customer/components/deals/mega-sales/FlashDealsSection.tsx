
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Zap, Clock, Star } from 'lucide-react';

export const FlashDealsSection: React.FC = () => {
  const flashDeals = [
    {
      id: 1,
      image: "📱",
      title: "iPhone 15 Pro Max",
      originalPrice: 180000,
      salePrice: 108000,
      discount: 40,
      timeLeft: "2h 15m",
      sold: 234,
      stock: 12,
      rating: 4.9
    },
    {
      id: 2,
      image: "💻",
      title: "MacBook Air M3",
      originalPrice: 150000,
      salePrice: 105000,
      discount: 30,
      timeLeft: "1h 45m",
      sold: 156,
      stock: 8,
      rating: 4.8
    },
    {
      id: 3,
      image: "⌚",
      title: "Apple Watch Series 9",
      originalPrice: 45000,
      salePrice: 27000,
      discount: 40,
      timeLeft: "3h 30m",
      sold: 189,
      stock: 15,
      rating: 4.7
    },
    {
      id: 4,
      image: "🎧",
      title: "AirPods Pro (2nd gen)",
      originalPrice: 35000,
      salePrice: 24500,
      discount: 30,
      timeLeft: "4h 12m",
      sold: 298,
      stock: 25,
      rating: 4.9
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" />
            <h2 className="text-4xl font-bold">⚡ Flash Deals</h2>
            <Badge className="bg-red-500 text-white animate-pulse">Limited Time!</Badge>
          </div>
          <Button variant="outline" className="px-6">View All Flash Deals</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      {deal.image}
                    </div>
                  </div>
                  
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                    -{deal.discount}%
                  </Badge>
                  
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {deal.timeLeft}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(deal.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({deal.rating})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-red-600">৳{deal.salePrice.toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-sm">৳{deal.originalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mb-4">
                    <span>{deal.sold} sold</span>
                    <span className="text-red-600 font-semibold">Only {deal.stock} left!</span>
                  </div>
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
