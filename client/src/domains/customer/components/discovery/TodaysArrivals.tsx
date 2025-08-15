
import React from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { Clock, ArrowRight } from 'lucide-react';

export const TodaysArrivals: React.FC = () => {
  const todaysProducts = [
    {
      id: 'today-1',
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Smart Watches",
      title: "Apple Watch Series 9 - GPS + Cellular",
      originalPrice: "৳55,999",
      salePrice: "৳49,999",
      stockLeft: 12,
      rating: 4.8,
      reviews: 234,
      discount: "11% OFF",
      badge: "TODAY",
      timeAdded: "2 hours ago"
    },
    {
      id: 'today-2',
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Sneakers",
      title: "Nike Air Max 270 React - Limited Edition",
      originalPrice: "৳18,999",
      salePrice: "৳15,999",
      stockLeft: 8,
      rating: 4.7,
      reviews: 156,
      discount: "16% OFF",
      badge: "TODAY",
      timeAdded: "4 hours ago"
    },
    {
      id: 'today-3',
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Sony WH-1000XM5 Noise Canceling Headphones",
      originalPrice: "৳0", // MOCK DATA REMOVED
      salePrice: "৳36,999",
      stockLeft: 15,
      rating: 4.9,
      reviews: 387,
      discount: "14% OFF",
      badge: "TODAY",
      timeAdded: "6 hours ago"
    },
    {
      id: 'today-4',
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Ray-Ban Aviator Classic - Polarized",
      originalPrice: "৳24,999",
      salePrice: "৳19,999",
      stockLeft: 5,
      rating: 4.6,
      reviews: 289,
      discount: "20% OFF",
      badge: "TODAY",
      timeAdded: "8 hours ago"
    }
  ];

  return (
    <section id="today-arrivals" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">✨ Today's New Arrivals</h2>
              <p className="text-gray-600">Fresh products that arrived today</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-red-700 transition-all">
            View All Today's Items <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {todaysProducts.map((product, index) => (
            <div key={index} className="relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                {product.timeAdded}
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
