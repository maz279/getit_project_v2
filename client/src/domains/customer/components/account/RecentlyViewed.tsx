
import React from 'react';
import { Eye, Star, ShoppingCart, Clock } from 'lucide-react';

export const RecentlyViewed: React.FC = () => {
  const recentItems = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 135000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      rating: 4.9,
      viewedAt: '2 hours ago'
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 125000,
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop',
      rating: 4.8,
      viewedAt: '5 hours ago'
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      price: 28999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.6,
      viewedAt: '1 day ago'
    },
    {
      id: 4,
      name: 'Samsung Galaxy Watch',
      price: 32000,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop',
      rating: 4.5,
      viewedAt: '2 days ago'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentItems.map((item) => (
          <div key={item.id} className="group bg-gray-50 rounded-lg p-3 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="relative mb-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-24 object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ShoppingCart className="w-3 h-3 text-gray-600" />
              </div>
            </div>
            
            <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
            
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">{item.rating}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900">৳{item.price.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{item.viewedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
