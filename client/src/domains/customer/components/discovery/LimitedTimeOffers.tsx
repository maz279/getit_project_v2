
import React, { useState, useEffect } from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { Timer, Zap } from 'lucide-react';

export const LimitedTimeOffers: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
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
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const limitedOffers = [
    {
      id: 'limited-1',
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Photography",
      title: "Canon EOS R5 Mirrorless Camera",
      originalPrice: "৳399,999",
      salePrice: "৳299,999",
      stockLeft: 3,
      rating: 4.9,
      reviews: 89,
      discount: "25% OFF",
      badge: "LIMITED",
      sold: 12,
      totalStock: 15
    },
    {
      id: 'limited-2',
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "Mechanical Gaming Keyboard RGB",
      originalPrice: "৳15,999",
      salePrice: "৳9,999",
      stockLeft: 7,
      rating: 4.8,
      reviews: 234,
      discount: "37% OFF",
      badge: "LIMITED",
      sold: 18,
      totalStock: 25
    },
    {
      id: 'limited-3',
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Kitchen",
      title: "Smart Coffee Machine with WiFi",
      originalPrice: "৳45,999",
      salePrice: "৳29,999",
      stockLeft: 4,
      rating: 4.7,
      reviews: 156,
      discount: "35% OFF",
      badge: "LIMITED",
      sold: 21,
      totalStock: 25
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-red-500 to-orange-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">⚡ Limited Time New Arrival Offers</h2>
          <p className="text-xl mb-8">Exclusive deals on newest products - Limited quantity available!</p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <Timer className="w-6 h-6" />
            <span className="text-lg font-medium">Offer ends in:</span>
            <div className="flex gap-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <div className="text-xs">Hours</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <div className="text-xs">Minutes</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <div className="text-xs">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {limitedOffers.map((product, index) => (
            <div key={index} className="relative">
              <div className="absolute -top-3 -left-3 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg animate-pulse">
                🔥 {product.sold}/{product.totalStock} SOLD
              </div>
              <div className="bg-white rounded-2xl p-1 shadow-2xl">
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
                  isFlashSale={true}
                  onAddToCart={() => console.log(`Added ${product.title} to cart`)}
                  onClick={() => console.log(`Clicked on ${product.title}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
