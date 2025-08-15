
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Users, ShoppingBag, Star, Truck } from 'lucide-react';

export const SaleStatsSection: React.FC = () => {
  const stats = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      number: "2.5M+",
      label: "Happy Customers",
      subtitle: "Shopping today"
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-green-600" />,
      number: "50K+",
      label: "Products on Sale",
      subtitle: "Across all categories"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      number: "4.9/5",
      label: "Customer Rating",
      subtitle: "From verified buyers"
    },
    {
      icon: <Truck className="w-8 h-8 text-purple-600" />,
      number: "24hrs",
      label: "Express Delivery",
      subtitle: "Within Dhaka"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-gray-800 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
