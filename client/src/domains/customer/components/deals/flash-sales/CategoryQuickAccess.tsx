
import React from 'react';
import { Button } from '@/shared/ui/button';
import { ArrowRight } from 'lucide-react';

export const CategoryQuickAccess: React.FC = () => {
  const categories = [
    {
      title: 'MOBILES & ELECTRONICS',
      discount: 'Up to 60% OFF',
      starting: 'Starting ৳2,999',
      icon: '📱',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      title: 'FASHION & LIFESTYLE',
      discount: 'Up to 75% OFF', 
      starting: 'Starting ৳299',
      icon: '👕',
      bgColor: 'from-pink-500 to-pink-600'
    },
    {
      title: 'HOME & LIVING',
      discount: 'Up to 55% OFF',
      starting: 'Starting ৳199', 
      icon: '🏠',
      bgColor: 'from-green-500 to-green-600'
    },
    {
      title: 'BEAUTY & PERSONAL CARE',
      discount: 'Up to 70% OFF',
      starting: 'Starting ৳149',
      icon: '💄',
      bgColor: 'from-purple-500 to-purple-600'
    },
    {
      title: 'APPLIANCES & GADGETS',
      discount: 'Up to 80% OFF',
      starting: 'Starting ৳999',
      icon: '⚡',
      bgColor: 'from-orange-500 to-orange-600'
    },
    {
      title: 'GAMING & ENTERTAINMENT', 
      discount: 'Up to 65% OFF',
      starting: 'Starting ৳799',
      icon: '🎮',
      bgColor: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          🔥 Category Quick Access 🔥
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${category.bgColor} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{category.icon}</span>
                <ArrowRight className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{category.title}</h3>
              <p className="text-yellow-200 font-semibold mb-1">{category.discount}</p>
              <p className="text-sm mb-4">{category.starting}</p>
              <Button className="w-full bg-white text-gray-800 hover:bg-gray-100">
                Shop Now →
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
