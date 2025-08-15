import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { TrendingUp, ArrowRight } from 'lucide-react';

export const TrendingProducts: React.FC = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/categories?trending=products');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const products = [
    {
      id: 'trending-1',
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Watches",
      title: "Smart Fitness Watch - Heart Rate Monitor",
      originalPrice: "৳23,999",
      salePrice: "৳17,999",
      stockLeft: 8,
      rating: 4.7,
      reviews: 342,
      discount: "25% OFF",
      badge: "Trending"
    },
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Premium Wireless Earbuds - Noise Cancelling",
      originalPrice: "৳21,599",
      salePrice: "৳15,599",
      stockLeft: 12,
      rating: 4.6,
      reviews: 567,
      discount: "28% OFF",
      badge: "Hot"
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "Wireless Gaming Mouse - RGB Lighting",
      originalPrice: "৳10,799",
      salePrice: "৳7,199",
      stockLeft: 15,
      rating: 4.8,
      reviews: 234,
      discount: "33% OFF",
      badge: "Gaming"
    },
    {
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Polarized Sunglasses - UV400 Protection",
      originalPrice: "৳17,999",
      salePrice: "৳10,799",
      stockLeft: 6,
      rating: 4.5,
      reviews: 189,
      discount: "40% OFF",
      badge: "Fashion"
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Sports",
      title: "Running Shoes - Advanced Cushioning",
      originalPrice: "৳16,799",
      salePrice: "৳11,999",
      stockLeft: 9,
      rating: 4.7,
      reviews: 456,
      discount: "29% OFF",
      badge: "Sports"
    },
    {
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Home",
      title: "Smart Coffee Maker - WiFi Enabled",
      originalPrice: "৳23,999",
      salePrice: "৳16,799",
      stockLeft: 4,
      rating: 4.4,
      reviews: 178,
      discount: "30% OFF",
      badge: "Smart Home"
    },
    {
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      category: "Tech",
      title: "Portable Laptop Stand - Adjustable Height",
      originalPrice: "৳9,599",
      salePrice: "৳5,999",
      stockLeft: 18,
      rating: 4.6,
      reviews: 298,
      discount: "37% OFF",
      badge: "Office"
    },
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      category: "Mobile",
      title: "Wireless Charging Pad - Fast Charge",
      originalPrice: "৳7,199",
      salePrice: "৳4,799",
      stockLeft: 22,
      rating: 4.3,
      reviews: 145,
      discount: "33% OFF",
      badge: "Accessories"
    }
  ];

  return (
    <section className="py-6 bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Trending Products</h2>
              <p className="text-gray-600">Most popular items this week</p>
            </div>
          </div>
          <button 
            onClick={handleViewAll}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-green-600 transition-all font-semibold"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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
              badge={product.badge}
              isCompact={true}
              onAddToCart={() => console.log(`Added trending product ${index + 1} to cart`)}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
