
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, Star, ShoppingCart } from 'lucide-react';

export const BestSellersSection: React.FC = () => {
  const bestSellers = [
    {
      rank: 1,
      image: "🔥",
      title: "Xiaomi Redmi Note 13 Pro",
      price: 35999,
      originalPrice: 45999,
      rating: 4.8,
      reviews: 1234,
      sold: 5678
    },
    {
      rank: 2,
      image: "⭐",
      title: "Samsung Galaxy Buds FE",
      price: 8999,
      originalPrice: 12999,
      rating: 4.7,
      reviews: 856,
      sold: 3421
    },
    {
      rank: 3,
      image: "🏆",
      title: "Nike Air Force 1",
      price: 12500,
      originalPrice: 16800,
      rating: 4.9,
      reviews: 567,
      sold: 2134
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <h2 className="text-4xl font-bold">🏆 Best Sellers This Week</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.map((product, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-orange-500 text-white font-bold text-lg px-3 py-1">
                  #{product.rank}
                </Badge>
              </div>
              
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-12 text-center relative">
                  <div className="text-8xl mb-4">{product.image}</div>
                  <div className="absolute bottom-4 right-4 text-6xl opacity-20">
                    #{product.rank}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3">{product.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-orange-600">৳{product.price.toLocaleString()}</span>
                    <span className="text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{product.sold.toLocaleString()} sold this week</p>
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
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
