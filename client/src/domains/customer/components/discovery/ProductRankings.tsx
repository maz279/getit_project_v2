
import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

export const ProductRankings: React.FC = () => {
  const rankings = [
    {
      rank: 1,
      name: 'iPhone 15 Pro Max',
      category: 'Electronics',
      price: 135000,
      originalPrice: 145000,
      sales: '15K+',
      rating: 4.9,
      reviews: 2840,
      badge: 'HOT',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
    },
    {
      rank: 2,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Electronics',
      price: 125000,
      originalPrice: 135000,
      sales: '12K+',
      rating: 4.8,
      reviews: 1950,
      badge: 'NEW',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    },
    {
      rank: 3,
      name: 'Nike Air Jordan 1',
      category: 'Fashion',
      price: 15000,
      originalPrice: 18000,
      sales: '8K+',
      rating: 4.7,
      reviews: 1230,
      badge: 'TRENDING',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    },
    {
      rank: 4,
      name: 'Sony WH-1000XM5',
      category: 'Electronics',
      price: 28999,
      originalPrice: 32999,
      sales: '6K+',
      rating: 4.6,
      reviews: 890,
      badge: 'POPULAR',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    },
    {
      rank: 5,
      name: 'MacBook Air M2',
      category: 'Electronics',
      price: 125000,
      originalPrice: 135000,
      sales: '4K+',
      rating: 4.8,
      reviews: 1560,
      badge: 'BEST',
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop'
    },
    {
      rank: 6,
      name: 'Adidas Ultraboost',
      category: 'Fashion',
      price: 12000,
      originalPrice: 15000,
      sales: '5K+',
      rating: 4.5,
      reviews: 780,
      badge: 'SALE',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
    },
    {
      rank: 7,
      name: 'iPad Pro 11"',
      category: 'Electronics',
      price: 89999,
      originalPrice: 95000,
      sales: '3.5K+',
      rating: 4.8,
      reviews: 1340,
      badge: 'NEW',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    },
    {
      rank: 8,
      name: 'Canon EOS R5',
      category: 'Electronics',
      price: 285000,
      originalPrice: 300000,
      sales: '2.1K+',
      rating: 4.9,
      reviews: 560,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop'
    },
    {
      rank: 9,
      name: 'PlayStation 5',
      category: 'Gaming',
      price: 65000,
      originalPrice: 70000,
      sales: '4.2K+',
      rating: 4.7,
      reviews: 980,
      badge: 'HOT',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'
    },
    {
      rank: 10,
      name: 'Apple Watch Series 9',
      category: 'Electronics',
      price: 42000,
      originalPrice: 45000,
      sales: '3.8K+',
      rating: 4.6,
      reviews: 1120,
      badge: 'TRENDING',
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop'
    },
    {
      rank: 11,
      name: 'Puma RS-X',
      category: 'Fashion',
      price: 9500,
      originalPrice: 12000,
      sales: '2.8K+',
      rating: 4.4,
      reviews: 650,
      badge: 'SALE',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
    },
    {
      rank: 12,
      name: 'Dell XPS 13',
      category: 'Electronics',
      price: 95000,
      originalPrice: 105000,
      sales: '1.9K+',
      rating: 4.5,
      reviews: 740,
      badge: 'BEST',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">🏆 Top Best Sellers This Week</h2>
          <p className="text-gray-600 text-lg">Most purchased products by our customers</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {rankings.map((product) => (
            <div 
              key={product.rank} 
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${
                    product.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    product.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                    product.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    #{product.rank}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full shadow-md ${
                    product.badge === 'HOT' ? 'bg-red-500 text-white' :
                    product.badge === 'NEW' ? 'bg-green-500 text-white' : 
                    product.badge === 'TRENDING' ? 'bg-blue-500 text-white' :
                    product.badge === 'POPULAR' ? 'bg-purple-500 text-white' :
                    product.badge === 'BEST' ? 'bg-yellow-500 text-white' :
                    product.badge === 'PREMIUM' ? 'bg-indigo-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-12 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors">
                    <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-5 mt-1">
                    {product.name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-green-600">৳{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                    <span className="text-xs text-green-500 font-medium">{product.sales}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
