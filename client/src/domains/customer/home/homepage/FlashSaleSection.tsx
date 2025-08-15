
import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Zap, Clock, Flame } from 'lucide-react';

export const FlashSaleSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 15,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const products = [
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Watches",
      title: "Luxury Smart Watch - Premium Steel Band",
      originalPrice: "৳35,999",
      salePrice: "৳23,999",
      stockLeft: 3,
      rating: 4.8,
      reviews: 245,
      discount: "33% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Wireless Noise-Canceling Headphones",
      originalPrice: "৳29,999",
      salePrice: "৳17,999",
      stockLeft: 7,
      rating: 4.7,
      reviews: 892,
      discount: "40% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      category: "Mobile",
      title: "Latest Smartphone - 128GB Storage",
      originalPrice: "৳95,999",
      salePrice: "৳71,999",
      stockLeft: 2,
      rating: 4.9,
      reviews: 1234,
      discount: "25% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Footwear",
      title: "Premium Running Shoes - Air Cushion",
      originalPrice: "৳19,199",
      salePrice: "৳11,999",
      stockLeft: 12,
      rating: 4.6,
      reviews: 567,
      discount: "37% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Designer Sunglasses - UV Protection",
      originalPrice: "৳23,999",
      salePrice: "৳14,399",
      stockLeft: 8,
      rating: 4.5,
      reviews: 334,
      discount: "40% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "Wireless Gaming Controller - Pro Edition",
      originalPrice: "৳10,799",
      salePrice: "৳7,199",
      stockLeft: 15,
      rating: 4.8,
      reviews: 678,
      discount: "33% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Home",
      title: "Smart Coffee Maker - Programmable",
      originalPrice: "৳21,599",
      salePrice: "৳14,399",
      stockLeft: 5,
      rating: 4.4,
      reviews: 456,
      discount: "33% OFF",
      isFlashSale: true
    },
    {
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      category: "Tech",
      title: "Ultra-Portable Laptop - 14 inch Display",
      originalPrice: "৳155,999",
      salePrice: "৳119,999",
      stockLeft: 1,
      rating: 4.9,
      reviews: 789,
      discount: "23% OFF",
      isFlashSale: true
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-blue-600 to-green-500 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-yellow-400 bg-opacity-20 p-3 rounded-full animate-pulse">
                <Flame className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  <Zap className="w-8 h-8 text-yellow-300" />
                  Flash Sale
                </h2>
                <p className="opacity-90 text-lg">Limited time offers - Don't miss out!</p>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Ends in:</span>
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[60px] border border-yellow-300 border-opacity-30">
                    <div className="text-2xl font-bold text-yellow-300">{value.toString().padStart(2, '0')}</div>
                    <div className="text-xs uppercase text-yellow-200">{unit.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid - Uniform Size */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {products.map((product, index) => (
              <ProductCard
                key={index}
                image={product.image}
                category={product.category}
                title={product.title}
                originalPrice={product.originalPrice}
                salePrice={product.salePrice}
                stockLeft={product.stockLeft}
                rating={product.rating}
                reviews={product.reviews}
                discount={product.discount}
                isFlashSale={product.isFlashSale}
                isCompact={true}
                onAddToCart={() => console.log(`Added flash sale product ${index + 1} to cart`)}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gradient-to-r from-blue-500 to-green-500 shadow-lg rounded-full p-3 hover:from-blue-600 hover:to-green-600 transition-all text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gradient-to-r from-red-500 to-yellow-500 shadow-lg rounded-full p-3 hover:from-red-600 hover:to-yellow-600 transition-all text-white">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-blue-500 via-red-500 to-green-500 text-white font-bold px-10 py-4 rounded-full hover:from-blue-600 hover:via-red-600 hover:to-green-600 transition-all transform hover:scale-105 shadow-xl text-lg">
            <Zap className="w-5 h-5 inline mr-2" />
            View All Flash Sale Items
          </button>
        </div>
      </div>
    </section>
  );
};
