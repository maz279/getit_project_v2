
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

export const BrandShowcaseSection: React.FC = () => {
  const brands = [
    { name: "Apple", logo: "🍎", discount: "Up to 25% OFF" },
    { name: "Samsung", logo: "📱", discount: "Up to 35% OFF" },
    { name: "Sony", logo: "🎮", discount: "Up to 30% OFF" },
    { name: "Nike", logo: "👟", discount: "Up to 40% OFF" },
    { name: "Xiaomi", logo: "📲", discount: "Up to 45% OFF" },
    { name: "Adidas", logo: "⚽", discount: "Up to 35% OFF" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🏷️ Top Brand Deals</h2>
          <p className="text-xl text-gray-600">Exclusive discounts from your favorite brands</p>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {brand.logo}
                </div>
                <h3 className="font-bold text-lg mb-2">{brand.name}</h3>
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {brand.discount}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
