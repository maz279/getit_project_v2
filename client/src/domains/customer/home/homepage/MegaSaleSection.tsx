
import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Zap, Clock, Flame } from 'lucide-react';

export const MegaSaleSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 30,
    seconds: 45
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
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const products = [
    {
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&h=300&fit=crop",
      category: "Electronics",
      title: "4K Smart TV - 55 inch Ultra HD",
      originalPrice: "৳107,999",
      salePrice: "৳65,879",
      stockLeft: 3,
      rating: 4.8,
      reviews: 234,
      discount: "39% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop",
      category: "Computers",
      title: "Gaming Laptop - RTX Graphics",
      originalPrice: "৳191,999",
      salePrice: "৳119,999",
      stockLeft: 2,
      rating: 4.9,
      reviews: 567,
      discount: "37% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
      category: "Home",
      title: "Robot Vacuum Cleaner - Smart Navigation",
      originalPrice: "৳59,999",
      salePrice: "৳35,999",
      stockLeft: 5,
      rating: 4.6,
      reviews: 345,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
      category: "Kitchen",
      title: "Air Fryer XL - 8 Quart Capacity",
      originalPrice: "৳23,999",
      salePrice: "৳14,399",
      stockLeft: 8,
      rating: 4.7,
      reviews: 1234,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Studio Monitor Speakers - Professional",
      originalPrice: "৳47,999",
      salePrice: "৳29,999",
      stockLeft: 4,
      rating: 4.8,
      reviews: 189,
      discount: "37% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Photography",
      title: "DSLR Camera - 24MP Full Frame",
      originalPrice: "৳155,999",
      salePrice: "৳95,999",
      stockLeft: 1,
      rating: 4.9,
      reviews: 456,
      discount: "38% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      category: "Sports",
      title: "Electric Bike - 50 Mile Range",
      originalPrice: "৳239,999",
      salePrice: "৳155,999",
      stockLeft: 2,
      rating: 4.7,
      reviews: 123,
      discount: "35% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=300&fit=crop",
      category: "Beauty",
      title: "LED Light Therapy Mask - Anti-Aging",
      originalPrice: "৳35,999",
      salePrice: "৳21,599",
      stockLeft: 7,
      rating: 4.5,
      reviews: 298,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Designer Watch - Automatic Movement",
      originalPrice: "৳95,999",
      salePrice: "৳57,599",
      stockLeft: 3,
      rating: 4.8,
      reviews: 167,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=300&h=300&fit=crop",
      category: "Fitness",
      title: "Smart Exercise Bike - Interactive Training",
      originalPrice: "৳179,999",
      salePrice: "৳107,999",
      stockLeft: 4,
      rating: 4.6,
      reviews: 234,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&h=300&fit=crop",
      category: "Tools",
      title: "Cordless Drill Set - 20V Battery",
      originalPrice: "৳19,199",
      salePrice: "৳11,999",
      stockLeft: 12,
      rating: 4.4,
      reviews: 567,
      discount: "37% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop",
      category: "Garden",
      title: "Robotic Lawn Mower - GPS Navigation",
      originalPrice: "৳107,999",
      salePrice: "৳65,879",
      stockLeft: 2,
      rating: 4.7,
      reviews: 89,
      discount: "39% OFF"
    }
  ];

  return (
    <section className="py-6 bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">MEGA SALE</h2>
                <p className="opacity-90 text-lg">Up to 70% OFF - Limited Time Only!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <span className="text-lg font-semibold">Ends in:</span>
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                    <div className="text-xs uppercase">{unit.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
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
              isFlashSale={true}
              isCompact={true}
              onAddToCart={() => console.log(`Added mega sale product ${index + 1} to cart`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
