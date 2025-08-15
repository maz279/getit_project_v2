
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

export const CategoryDealsSection: React.FC = () => {
  const categories = [
    {
      name: "Electronics",
      emoji: "📱",
      discount: "Up to 70% OFF",
      products: "15,000+ items",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Fashion",
      emoji: "👕",
      discount: "Up to 60% OFF",
      products: "25,000+ items",
      color: "from-pink-500 to-purple-500"
    },
    {
      name: "Home & Garden",
      emoji: "🏠",
      discount: "Up to 55% OFF",
      products: "12,000+ items",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Beauty & Health",
      emoji: "💄",
      discount: "Up to 65% OFF",
      products: "8,000+ items",
      color: "from-rose-500 to-pink-500"
    },
    {
      name: "Sports & Outdoor",
      emoji: "⚽",
      discount: "Up to 50% OFF",
      products: "6,000+ items",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Books & Education",
      emoji: "📚",
      discount: "Up to 45% OFF",
      products: "10,000+ items",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🛍️ Shop by Category</h2>
          <p className="text-xl text-gray-600">Massive discounts across all categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${category.color} p-6 text-white text-center relative`}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </div>
                  <Badge className="bg-white/20 text-white text-xs mb-2">
                    {category.discount}
                  </Badge>
                </div>
                
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.products}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Shop Now
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
