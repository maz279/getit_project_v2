
import React from 'react';
import { Clock, Star, Truck, Shield } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const LightningDealsSection: React.FC = () => {
  const lightningDeals = [
    {
      id: 1,
      name: 'Samsung Galaxy A54 5G',
      description: '128GB | 6GB RAM | Triple Camera',
      originalPrice: 39999,
      salePrice: 24999,
      discount: 37,
      savings: 15000,
      timeLeft: '02:34:12',
      stock: 23,
      rating: 4.5,
      reviews: 2847,
      features: ['Official warranty', '7-day return policy', 'Cash on delivery'],
      image: '📱',
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Premium Cotton T-Shirt Combo',
      description: '3 pieces | Sizes: M, L, XL, XXL',
      originalPrice: 2399,
      salePrice: 899,
      discount: 62,
      savings: 1500,
      timeLeft: '02:34:12',
      stock: 47,
      rating: 4.7,
      reviews: 1234,
      features: ['100% pure cotton', 'Pre-shrunk fabric', 'Machine washable'],
      image: '👕',
      category: 'Fashion'
    },
    {
      id: 3,
      name: 'Digital Air Fryer 5L',
      description: 'Oil-Free Healthy Cooking | 8 Pre-set Programs',
      originalPrice: 8999,
      salePrice: 4499,
      discount: 50,
      savings: 4500,
      timeLeft: '02:34:12',
      stock: 15,
      rating: 4.6,
      reviews: 956,
      features: ['2-year warranty', 'Recipe book included', 'Energy efficient'],
      image: '🏠',
      category: 'Home Appliance'
    },
    {
      id: 4,
      name: 'Korean Skincare 7-Step Set',
      description: 'Anti-aging + Brightening | For All Skin Types',
      originalPrice: 3999,
      salePrice: 1299,
      discount: 67,
      savings: 2700,
      timeLeft: '02:34:12',
      stock: 8,
      rating: 4.8,
      reviews: 3421,
      features: ['Dermatologist tested', 'Cruelty-free', 'Natural ingredients'],
      image: '💄',
      category: 'Beauty'
    }
  ];

  return (
    <section id="lightning-deals" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            ⭐ LIGHTNING DEALS - LIMITED STOCK ⭐
          </h2>
          <p className="text-gray-600 mb-2">Unbelievable prices for the next few hours only!</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              🔥 New deals every hour
            </span>
            <span className="flex items-center gap-1">
              ⚡ Limited quantity
            </span>
            <span className="flex items-center gap-1">
              🚚 Fast delivery
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lightningDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl">{deal.image}</span>
                </div>
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  🔥 {deal.discount}% OFF
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{deal.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{deal.description}</p>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-red-600">৳{deal.salePrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through">৳{deal.originalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold">💰 Save ৳{deal.savings.toLocaleString()}</p>
                </div>

                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Deal ends in:
                    </span>
                    <span className="font-bold text-red-600">{deal.timeLeft}</span>
                  </div>
                  <div className="text-sm text-orange-600">
                    📦 Only {deal.stock} left in stock!
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{deal.rating}/5 ({deal.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>

                <div className="mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1 mb-1">
                    <Truck className="w-4 h-4" />
                    🚚 FREE delivery tomorrow
                  </div>
                  <div>💳 বিকাশ/নগদ/রকেট accepted</div>
                </div>

                <div className="flex gap-2 mb-3">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">
                    🛒 Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    ❤️
                  </Button>
                </div>

                <div className="space-y-1">
                  {deal.features.map((feature, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
