
import React, { useState, useEffect } from 'react';
import { Clock, Flame, ShoppingCart, Star, Heart, Eye } from 'lucide-react';

export const DealsCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const deals = [
    { 
      name: 'MacBook Air M2', 
      originalPrice: 125000, 
      salePrice: 89999, 
      discount: 28,
      rating: 4.8,
      reviews: 1250,
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop'
    },
    { 
      name: 'Sony WH-1000XM5', 
      originalPrice: 35000, 
      salePrice: 24999, 
      discount: 29,
      rating: 4.7,
      reviews: 890,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    },
    { 
      name: 'iPad Pro 11"', 
      originalPrice: 95000, 
      salePrice: 69999, 
      discount: 26,
      rating: 4.9,
      reviews: 2100,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    },
    { 
      name: 'AirPods Pro', 
      originalPrice: 28000, 
      salePrice: 19999, 
      discount: 29,
      rating: 4.6,
      reviews: 760,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop'
    },
    { 
      name: 'iPhone 15 Pro', 
      originalPrice: 135000, 
      salePrice: 125000, 
      discount: 7,
      rating: 4.9,
      reviews: 3200,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">⚡ Flash Deal ⚡</h2>
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 inline-block shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-semibold text-gray-700">Time Remaining:</span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="bg-gradient-to-b from-orange-500 to-red-500 text-white rounded-xl p-4 min-w-[60px] shadow-lg">
                  <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                </div>
                <div className="text-sm mt-2 font-medium text-gray-600">Hours</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-b from-orange-500 to-red-500 text-white rounded-xl p-4 min-w-[60px] shadow-lg">
                  <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                </div>
                <div className="text-sm mt-2 font-medium text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-b from-orange-500 to-red-500 text-white rounded-xl p-4 min-w-[60px] shadow-lg">
                  <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                </div>
                <div className="text-sm mt-2 font-medium text-gray-600">Seconds</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {deals.map((deal, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={deal.image} 
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    -{deal.discount}%
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors">
                    <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 leading-5">
                  {deal.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-3">
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
                  <span className="text-xs text-gray-500">({deal.reviews})</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">৳{deal.salePrice.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-gray-400 line-through">৳{deal.originalPrice.toLocaleString()}</span>
                </div>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
