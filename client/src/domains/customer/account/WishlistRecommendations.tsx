
import React from 'react';
import { Sparkles, Star, ShoppingCart, Heart, Plus } from 'lucide-react';

export const WishlistRecommendations: React.FC = () => {
  const recommendations = [
    {
      id: 1,
      name: 'iPad Pro 11" (2024)',
      price: 89999,
      originalPrice: 95000,
      rating: 4.8,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      reason: 'Based on your Electronics wishlist'
    },
    {
      id: 2,
      name: 'Apple Watch Series 9',
      price: 42000,
      originalPrice: 45000,
      rating: 4.6,
      reviews: 1120,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop',
      reason: 'Frequently bought together'
    },
    {
      id: 3,
      name: 'AirPods Pro (2nd Gen)',
      price: 24999,
      originalPrice: 28999,
      rating: 4.7,
      reviews: 890,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop',
      reason: 'Perfect with your phone'
    },
    {
      id: 4,
      name: 'Adidas Ultraboost 23',
      price: 12000,
      originalPrice: 15000,
      rating: 4.5,
      reviews: 780,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      reason: 'Similar to your saved items'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-600 text-sm">Based on your wishlist and browsing history</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View More
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <div key={item.id} className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button className="p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                  <Heart className="w-3 h-3 text-gray-600 hover:text-red-500" />
                </button>
                <button className="p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50">
                  <Plus className="w-3 h-3 text-gray-600 hover:text-blue-500" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>
            
            <div className="p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">{item.reason}</p>
              <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{item.name}</h3>
              
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(item.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({item.reviews})</span>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">৳{item.price.toLocaleString()}</span>
                </div>
                <span className="text-sm text-gray-400 line-through">৳{item.originalPrice.toLocaleString()}</span>
              </div>
              
              <button className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
