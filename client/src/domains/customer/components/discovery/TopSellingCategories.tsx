
import React from 'react';
import { Smartphone, Shirt, Home, ShoppingBag, Heart, Utensils } from 'lucide-react';

export const TopSellingCategories: React.FC = () => {
  const categories = [
    {
      icon: <Shirt className="w-8 h-8" />,
      name: 'Traditional Fashion',
      description: 'Handcrafted sarees, premium salwar kameez',
      sales: '25K+ sold',
      discount: 'Up to 40% OFF',
      color: 'from-pink-500 to-purple-500'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      name: 'Electronics & Accessories',
      description: 'Latest smartphones, tablets, gaming',
      sales: '18K+ sold',
      discount: 'Up to 35% OFF',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <Home className="w-8 h-8" />,
      name: 'Home Essentials',
      description: 'Premium kitchenware, furniture, decor',
      sales: '32K+ sold',
      discount: 'Up to 50% OFF',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      name: 'Local Groceries',
      description: 'Authentic Basmati rice, spices, produce',
      sales: '45K+ sold',
      discount: 'Up to 25% OFF',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      name: 'Health & Beauty',
      description: 'Skincare, cosmetics for local climate',
      sales: '22K+ sold',
      discount: 'Up to 45% OFF',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      name: 'Handicrafts',
      description: 'Authentic Bengali crafts, textiles',
      sales: '12K+ sold',
      discount: 'Up to 30% OFF',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Categories</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            From traditional Bengali fashion to cutting-edge electronics, these crowd favorites have earned their place through 
            exceptional customer reviews and consistent demand across Bangladesh.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="group cursor-pointer">
              <div className={`bg-gradient-to-br ${category.color} text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-2">{category.name}</h3>
                  <p className="text-xs opacity-90 mb-3">{category.description}</p>
                  <div className="space-y-1">
                    <div className="text-xs font-medium">{category.sales}</div>
                    <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {category.discount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
