import React from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { TrendingUp, Flame } from 'lucide-react';

export const TrendingNow: React.FC = () => {
  const trendingProducts = [
    {
      id: 'trend-1',
      image: "https://images.unsplash.com/photo-1571019613540-996a8c044e55?w=300&h=300&fit=crop",
      category: "Fitness",
      title: "Smart Exercise Bike with Virtual Training",
      originalPrice: "৳149,999",
      salePrice: "৳119,999",
      stockLeft: 8,
      rating: 4.8,
      reviews: 345,
      discount: "20% OFF",
      badge: "TRENDING",
      trendPercentage: "+250%"
    },
    {
      id: 'trend-2',
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Professional Studio Monitor Speakers",
      originalPrice: "৳0", // MOCK DATA REMOVED
      salePrice: "৳69,999",
      stockLeft: 12,
      rating: 4.9,
      reviews: 178,
      discount: "22% OFF",
      badge: "TRENDING",
      trendPercentage: "+180%"
    },
    {
      id: 'trend-3',
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=300&fit=crop",
      category: "Beauty Tech",
      title: "LED Light Therapy Facial Device",
      originalPrice: "৳39,999",
      salePrice: "৳24,999",
      stockLeft: 15,
      rating: 4.7,
      reviews: 267,
      discount: "37% OFF",
      badge: "TRENDING",
      trendPercentage: "+320%"
    },
    {
      id: 'trend-4',
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      category: "Tech",
      title: "Ultra-Fast Wireless Charging Station",
      originalPrice: "৳12,999",
      salePrice: "৳8,999",
      stockLeft: 25,
      rating: 4.6,
      reviews: 432,
      discount: "31% OFF",
      badge: "TRENDING",
      trendPercentage: "+190%"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🔥 Trending New Arrivals</h2>
          <p className="text-gray-600 text-lg">Most popular new products everyone's talking about</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {product.trendPercentage}
              </div>
              <div className="absolute -top-1 -left-1 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                #trending
              </div>
              <ProductCard
                image={product.image}
                category={product.category}
                title={product.title}
                originalPrice={product.originalPrice}
                salePrice={product.salePrice}
                stockLeft={product.stockLeft}
                rating={product.rating}
                reviews={product.reviews}
                discount={product.discount}
                badge={product.badge}
                onAddToCart={() => console.log(`Added ${product.title} to cart`)}
                onClick={() => console.log(`Clicked on ${product.title}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
