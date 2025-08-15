
import React from 'react';
import { ProductCard } from './ProductCard';
import { Heart, Target } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  const products = [
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Wireless Bluetooth Headphones - Noise Cancelling",
      originalPrice: "৳14,999",
      salePrice: "৳9,999",
      stockLeft: 5,
      rating: 4.6,
      reviews: 234,
      discount: "33% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Smart Fitness Watch - Health Monitoring",
      originalPrice: "৳24,999",
      salePrice: "৳16,999",
      stockLeft: 8,
      rating: 4.5,
      reviews: 189,
      discount: "32% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Premium Coffee Maker - Auto Brew",
      originalPrice: "৳19,999",
      salePrice: "৳13,999",
      stockLeft: 3,
      rating: 4.7,
      reviews: 156,
      discount: "30% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Wireless Charging Pad - Fast Charge",
      originalPrice: "৳7,999",
      salePrice: "৳4,999",
      stockLeft: 12,
      rating: 4.4,
      reviews: 298,
      discount: "37% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Bluetooth Speaker - Waterproof",
      originalPrice: "৳12,999",
      salePrice: "৳8,999",
      stockLeft: 7,
      rating: 4.8,
      reviews: 167,
      discount: "31% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Robot Vacuum - Smart Mapping",
      originalPrice: "৳49,999",
      salePrice: "৳34,999",
      stockLeft: 4,
      rating: 4.6,
      reviews: 123,
      discount: "30% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Air Fryer - Digital Display",
      originalPrice: "৳22,999",
      salePrice: "৳15,999",
      stockLeft: 6,
      rating: 4.7,
      reviews: 289,
      discount: "30% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "LED Beauty Mirror - Touch Control",
      originalPrice: "৳11,999",
      salePrice: "৳7,999",
      stockLeft: 9,
      rating: 4.5,
      reviews: 234,
      discount: "33% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Designer Handbag - Premium Leather",
      originalPrice: "৳18,999",
      salePrice: "৳12,999",
      stockLeft: 5,
      rating: 4.8,
      reviews: 145,
      discount: "32% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Exercise Mat - Non-slip Yoga",
      originalPrice: "৳4,999",
      salePrice: "৳2,999",
      stockLeft: 15,
      rating: 4.4,
      reviews: 345,
      discount: "40% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Digital Camera - 4K Video",
      originalPrice: "৳0", // MOCK DATA REMOVED - USE DATABASE
      salePrice: "৳64,999",
      stockLeft: 2,
      rating: 4.9,
      reviews: 78,
      discount: "28% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Tool Set - Professional Grade",
      originalPrice: "৳16,999",
      salePrice: "৳11,999",
      stockLeft: 8,
      rating: 4.6,
      reviews: 267,
      discount: "29% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Smart TV - 43 inch 4K",
      originalPrice: "৳64,999",
      salePrice: "৳44,999",
      stockLeft: 3,
      rating: 4.7,
      reviews: 189,
      discount: "31% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Gaming Mouse - RGB Lighting",
      originalPrice: "৳8,999",
      salePrice: "৳5,999",
      stockLeft: 11,
      rating: 4.5,
      reviews: 234,
      discount: "33% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Electric Scooter - Foldable",
      originalPrice: "৳79,999",
      salePrice: "৳54,999",
      stockLeft: 4,
      rating: 4.6,
      reviews: 123,
      discount: "31% OFF",
      badge: "FOR YOU"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
      category: "Recommended",
      title: "Luxury Watch - Stainless Steel",
      originalPrice: "৳34,999",
      salePrice: "৳24,999",
      stockLeft: 6,
      rating: 4.8,
      reviews: 167,
      discount: "29% OFF",
      badge: "FOR YOU"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
              <p className="text-gray-600">Handpicked based on your interests</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-teal-600 transition-all">
            <Heart className="w-4 h-4" /> More for You
          </button>
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
              badge={product.badge}
              isCompact={true}
              onAddToCart={() => console.log(`Added recommended product ${index + 1} to cart`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
