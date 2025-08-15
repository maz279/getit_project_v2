
import React, { useState, useEffect } from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Gift, Star, Truck, Shield, Clock, Sparkles, Tag, Heart } from 'lucide-react';
import { ProductCard } from '../components/homepage/ProductCard';

const EidSale: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 15,
    hours: 8,
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
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const eidProducts = [
    {
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      category: "Traditional Wear",
      title: "Premium Eid Panjabi for Men",
      originalPrice: "৳3,500",
      salePrice: "৳2,450",
      stockLeft: 8,
      rating: 4.8,
      reviews: 245,
      discount: "30% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=400",
      category: "Women's Fashion",
      title: "Elegant Eid Saree Collection",
      originalPrice: "৳5,000",
      salePrice: "৳3,000",
      stockLeft: 12,
      rating: 4.9,
      reviews: 189,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
      category: "Jewelry",
      title: "Gold Plated Eid Jewelry Set",
      originalPrice: "৳2,800",
      salePrice: "৳1,960",
      stockLeft: 5,
      rating: 4.7,
      reviews: 156,
      discount: "30% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      category: "Footwear",
      title: "Traditional Leather Mojari",
      originalPrice: "৳1,800",
      salePrice: "৳1,260",
      stockLeft: 15,
      rating: 4.6,
      reviews: 98,
      discount: "30% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      category: "Home Decor",
      title: "Eid Decoration Items Set",
      originalPrice: "৳1,200",
      salePrice: "৳720",
      stockLeft: 20,
      rating: 4.5,
      reviews: 134,
      discount: "40% OFF"
    },
    {
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      category: "Electronics",
      title: "Wireless Earbuds - Eid Special",
      originalPrice: "৳3,000",
      salePrice: "৳1,800",
      stockLeft: 25,
      rating: 4.4,
      reviews: 276,
      discount: "40% OFF"
    }
  ];

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Gift className="w-8 h-8" />
              <Sparkles className="w-8 h-8" />
              <Gift className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Eid Mubarak Sale</h1>
            <p className="text-xl mb-8">Up to 70% off on Eid Collection - Limited Time Offer!</p>
            
            {/* Countdown Timer */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <Clock className="w-6 h-6" />
              <span className="text-lg font-semibold">Sale ends in:</span>
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[70px]">
                    <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                    <div className="text-xs uppercase">{unit}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">✨ Special Eid Offers ✨</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Buy 2 Get 1 Free on selected items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Free gift wrapping service</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Traditional Collection</h3>
                <p className="text-gray-600">Authentic Eid clothing and accessories from top brands</p>
              </div>
              <div className="text-center">
                <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Premium Quality</h3>
                <p className="text-gray-600">Hand-picked items from verified and trusted vendors</p>
              </div>
              <div className="text-center">
                <Truck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Express Delivery</h3>
                <p className="text-gray-600">Fast delivery across Bangladesh before Eid</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">100% authentic products with return policy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: "Men's Wear", icon: "👔", discount: "Up to 50%" },
                { name: "Women's Wear", icon: "👗", discount: "Up to 60%" },
                { name: "Kids Fashion", icon: "👶", discount: "Up to 40%" },
                { name: "Jewelry", icon: "💍", discount: "Up to 45%" },
                { name: "Footwear", icon: "👞", discount: "Up to 35%" },
                { name: "Home Decor", icon: "🏠", discount: "Up to 50%" }
              ].map((category, index) => (
                <div key={category.name} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-orange-100">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-xs text-orange-500 font-medium">{category.discount}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Eid Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eidProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  {...product}
                  onAddToCart={() => console.log('Added to cart:', product.title)}
                  onWishlist={() => console.log('Added to wishlist:', product.title)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Special Offers Banner */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">🎉 Mega Eid Combo Offers 🎉</h2>
              <p className="text-lg mb-6">Mix & Match any 3 items and get the lowest priced item FREE!</p>
              <div className="flex justify-center gap-4">
                <button className="bg-white text-purple-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-all">
                  Shop Combo Deals
                </button>
                <button className="border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white hover:text-purple-600 transition-all">
                  View Terms
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default EidSale;
