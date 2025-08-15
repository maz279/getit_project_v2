
import React, { useState } from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Star, Brain, TrendingUp, Heart, Filter, RefreshCw, User, Eye } from 'lucide-react';
import { ProductCard } from '../components/homepage/ProductCard';

const Recommendations: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('for-you');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const recommendationCategories = [
    {
      id: 'for-you',
      title: 'For You',
      icon: User,
      description: 'Personalized picks based on your browsing history',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'trending',
      title: 'Trending Now',
      icon: TrendingUp,
      description: 'What\'s popular with other shoppers right now',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'similar',
      title: 'Similar to Wishlist',
      icon: Heart,
      description: 'Items similar to products in your wishlist',
      color: 'from-pink-500 to-red-500'
    },
    {
      id: 'viewed',
      title: 'Recently Viewed',
      icon: Eye,
      description: 'Products you\'ve looked at recently',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const recommendedProducts = [
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      category: "Electronics",
      title: "Wireless Bluetooth Headphones with Noise Cancellation",
      originalPrice: "৳4,500",
      salePrice: "৳3,150",
      stockLeft: 12,
      rating: 4.8,
      reviews: 342,
      discount: "30% OFF",
      matchPercentage: 95
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      category: "Fashion",
      title: "Premium Running Shoes - Comfortable & Durable",
      originalPrice: "৳6,000",
      salePrice: "৳4,200",
      stockLeft: 8,
      rating: 4.7,
      reviews: 256,
      discount: "30% OFF",
      matchPercentage: 92
    },
    {
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      category: "Home & Garden",
      title: "Smart LED Desk Lamp with USB Charging",
      originalPrice: "৳2,800",
      salePrice: "৳1,960",
      stockLeft: 15,
      rating: 4.6,
      reviews: 189,
      discount: "30% OFF",
      matchPercentage: 88
    },
    {
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
      category: "Beauty",
      title: "Organic Skincare Set - Natural & Effective",
      originalPrice: "৳3,200",
      salePrice: "৳2,240",
      stockLeft: 6,
      rating: 4.9,
      reviews: 421,
      discount: "30% OFF",
      matchPercentage: 91
    },
    {
      image: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?w=400",
      category: "Books",
      title: "Best Selling Fiction Collection - 5 Books Set",
      originalPrice: "৳1,500",
      salePrice: "৳1,050",
      stockLeft: 20,
      rating: 4.5,
      reviews: 167,
      discount: "30% OFF",
      matchPercentage: 85
    },
    {
      image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8c3a?w=400",
      category: "Sports",
      title: "Professional Yoga Mat with Carrying Strap",
      originalPrice: "৳2,000",
      salePrice: "৳1,400",
      stockLeft: 18,
      rating: 4.4,
      reviews: 298,
      discount: "30% OFF",
      matchPercentage: 89
    }
  ];

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Brain className="w-20 h-20 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">AI-Powered Recommendations</h1>
            <p className="text-2xl mb-8">🤖 Discover products tailored just for you 🤖</p>
            <p className="text-lg opacity-90 mb-8">Our advanced AI analyzes your preferences to find the perfect products</p>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">✨ Why Our AI Recommendations? ✨</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Smart learning algorithm</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-time trend analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Personalized for you</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendation Categories */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Choose Your Recommendation Type</h2>
              <button 
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {recommendationCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white text-center cursor-pointer transition-all transform hover:scale-105 ${
                      activeCategory === category.id ? 'ring-4 ring-purple-300 scale-105' : ''
                    }`}
                  >
                    <IconComponent className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Insights */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-bold text-lg text-purple-800">AI Insights for You</h3>
                  <p className="text-purple-600">Based on your recent activity and preferences</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <div className="font-semibold text-purple-700 mb-1">Top Interest</div>
                  <div className="text-gray-600">Electronics & Gadgets</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="font-semibold text-purple-700 mb-1">Price Range</div>
                  <div className="text-gray-600">৳1,000 - ৳5,000</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="font-semibold text-purple-700 mb-1">Shopping Time</div>
                  <div className="text-gray-600">Evening shopper</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                {recommendationCategories.find(cat => cat.id === activeCategory)?.title} Products
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                  <option>Best Match</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="relative">
                  <ProductCard
                    {...product}
                    onAddToCart={() => console.log('Added to cart:', product.title)}
                    onWishlist={() => console.log('Added to wishlist:', product.title)}
                  />
                  {/* AI Match Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {product.matchPercentage}% match
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                Load More Recommendations
              </button>
            </div>
          </div>
        </section>

        {/* How AI Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How Our AI Recommendation Engine Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">1</div>
                <h3 className="font-bold text-xl mb-3">Learn Your Preferences</h3>
                <p className="text-gray-600 leading-relaxed">Our AI continuously analyzes your browsing patterns, purchase history, and user interactions to understand your unique preferences and shopping behavior.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">2</div>
                <h3 className="font-bold text-xl mb-3">Analyze & Match Products</h3>
                <p className="text-gray-600 leading-relaxed">Advanced algorithms scan millions of products, comparing features, prices, and reviews to find items that perfectly match your interests and budget.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">3</div>
                <h3 className="font-bold text-xl mb-3">Deliver Personal Results</h3>
                <p className="text-gray-600 leading-relaxed">Get curated recommendations with match percentages, updated in real-time as your preferences evolve and new products become available.</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-8 md:p-12 text-white">
              <div className="text-center mb-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h2 className="text-3xl font-bold mb-4">Advanced AI Features</h2>
                <p className="text-xl opacity-90">Cutting-edge technology for better shopping experiences</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">Trend Prediction</h3>
                  <p className="text-sm text-gray-300">Anticipates upcoming trends based on market data</p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">Mood Detection</h3>
                  <p className="text-sm text-gray-300">Understands your shopping mood and preferences</p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">Quality Scoring</h3>
                  <p className="text-sm text-gray-300">Automatically rates product quality and value</p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">Real-time Updates</h3>
                  <p className="text-sm text-gray-300">Recommendations update as you browse and shop</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Discover Your Perfect Products?</h2>
            <p className="text-xl mb-8">Let our AI find exactly what you're looking for and more!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Get My Recommendations
              </button>
              <button className="border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-purple-600 transition-all">
                Learn About AI
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Recommendations;
