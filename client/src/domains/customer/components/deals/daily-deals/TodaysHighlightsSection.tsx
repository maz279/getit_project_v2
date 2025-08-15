
import React from 'react';
import { Clock, Star, Truck, Shield, CheckCircle, Heart } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const TodaysHighlightsSection: React.FC = () => {
  const dailyDeals = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium sound quality | 30-hour battery life',
      originalPrice: 3999,
      salePrice: 1999,
      discount: 50,
      savings: 2000,
      timeLeft: '23:45:30',
      stock: 15,
      rating: 4.6,
      reviews: 1234,
      image: '🎧',
      category: 'Electronics',
      verified: true
    },
    {
      id: 2,
      name: 'Premium Bed Sheet Set',
      description: '100% Cotton | King Size | 4 pieces',
      originalPrice: 4500,
      salePrice: 1800,
      discount: 60,
      savings: 2700,
      timeLeft: '23:45:30',
      stock: 8,
      rating: 4.8,
      reviews: 567,
      image: '🛏️',
      category: 'Home & Garden',
      verified: true
    },
    {
      id: 3,
      name: 'Smart Water Bottle',
      description: 'Temperature display | 500ml | BPA-free',
      originalPrice: 2200,
      salePrice: 999,
      discount: 55,
      savings: 1201,
      timeLeft: '23:45:30',
      stock: 25,
      rating: 4.4,
      reviews: 890,
      image: '💧',
      category: 'Health & Beauty',
      verified: true
    },
    {
      id: 4,
      name: 'Traditional Saree Collection',
      description: 'Handwoven silk | Authentic Bengali design | Festival ready',
      originalPrice: 5500,
      salePrice: 2200,
      discount: 60,
      savings: 3300,
      timeLeft: '23:45:30',
      stock: 12,
      rating: 4.7,
      reviews: 445,
      image: '👗',
      category: 'Fashion',
      verified: true
    },
    {
      id: 5,
      name: 'Premium Basmati Rice',
      description: '5kg pack | Imported quality | Aged 2 years',
      originalPrice: 1200,
      salePrice: 720,
      discount: 40,
      savings: 480,
      timeLeft: '23:45:30',
      stock: 50,
      rating: 4.5,
      reviews: 678,
      image: '🍚',
      category: 'Food & Groceries',
      verified: true
    },
    {
      id: 6,
      name: 'Educational Book Bundle',
      description: 'HSC preparation books | Complete set | Latest edition',
      originalPrice: 2800,
      salePrice: 1400,
      discount: 50,
      savings: 1400,
      timeLeft: '23:45:30',
      stock: 30,
      rating: 4.6,
      reviews: 234,
      image: '📚',
      category: 'Books & Education',
      verified: true
    }
  ];

  return (
    <section id="todays-highlights" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">⭐ Today's Highlighted Deals ⭐</h2>
          <p className="text-xl text-gray-600 mb-6">
            Hand-picked deals that expire at midnight - Don't miss out!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dailyDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl">{deal.image}</span>
                </div>
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  🔥 {deal.discount}% OFF
                </div>
                {deal.verified && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{deal.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{deal.description}</p>

                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-green-600">৳{deal.salePrice.toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">৳{deal.originalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold">💰 You Save ৳{deal.savings.toLocaleString()}</p>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      Deal expires in:
                    </span>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{deal.timeLeft}</span>
                  </div>
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    📦 Only {deal.stock} left today! Hurry up!
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>{deal.rating}/5 ({deal.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-500" />
                    <span>🚚 Same-day delivery in Dhaka</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>💳 bKash/Nagad/Rocket/COD accepted</span>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                    🛒 Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className="border-gray-300 hover:bg-red-50 hover:border-red-300">
                    <Heart className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="text-xs text-gray-600 flex items-center gap-1 bg-gray-50 p-2 rounded">
                  <Shield className="w-3 h-3 text-green-500" />
                  Daily deal guarantee - Valid until midnight | 7-day return policy
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
