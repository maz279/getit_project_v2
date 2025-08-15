
import React from 'react';
import { Clock, Star, ShoppingCart } from 'lucide-react';

export const LatestProducts: React.FC = () => {
  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 155000,
      rating: 4.9,
      isNew: true,
      hoursAgo: 2,
      image: '/placeholder.svg',
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Nike Air Jordan 1 Low',
      price: 12999,
      rating: 4.7,
      isNew: true,
      hoursAgo: 5,
      image: '/placeholder.svg',
      category: 'Fashion'
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      price: 125000,
      rating: 4.8,
      isNew: true,
      hoursAgo: 8,
      image: '/placeholder.svg',
      category: 'Electronics'
    },
    {
      id: 4,
      name: 'Dyson V15 Detect',
      price: 45000,
      rating: 4.6,
      isNew: true,
      hoursAgo: 12,
      image: '/placeholder.svg',
      category: 'Home & Garden'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Latest Product Arrivals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  NEW
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.hoursAgo}h ago
                </div>
              </div>
              
              <div className="p-4">
                <span className="text-xs text-purple-600 font-medium">{product.category}</span>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">New Release</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-lg font-bold text-gray-800">৳{product.price.toLocaleString()}</span>
                </div>
                
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
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
