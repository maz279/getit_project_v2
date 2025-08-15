
import React from 'react';
import { ProductCard } from './ProductCard';
import { TrendingUp, Award } from 'lucide-react';

export const TopSellingSection: React.FC = () => {
  const products = [
    {
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&h=300&fit=crop",
      category: "Electronics",
      title: "4K Smart TV 55\" - Ultra HD Display",
      originalPrice: "৳107,999",
      salePrice: "৳79,999",
      stockLeft: 4,
      rating: 4.8,
      reviews: 1234,
      discount: "26% OFF",
      badge: "#1 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop",
      category: "Computing",
      title: "Gaming Laptop - RTX Graphics Card",
      originalPrice: "৳179,999",
      salePrice: "৳139,999",
      stockLeft: 2,
      rating: 4.9,
      reviews: 892,
      discount: "22% OFF",
      badge: "#2 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Wearables",
      title: "Premium Smartwatch - Health Monitor",
      originalPrice: "৳35,999",
      salePrice: "৳25,999",
      stockLeft: 8,
      rating: 4.7,
      reviews: 567,
      discount: "28% OFF",
      badge: "#3 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Wireless Headphones - Noise Cancelling",
      originalPrice: "৳29,999",
      salePrice: "৳19,999",
      stockLeft: 12,
      rating: 4.6,
      reviews: 678,
      discount: "33% OFF",
      badge: "#4 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      category: "Mobile",
      title: "Latest Smartphone 256GB - 5G Ready",
      originalPrice: "৳95,999",
      salePrice: "৳75,999",
      stockLeft: 5,
      rating: 4.8,
      reviews: 1456,
      discount: "21% OFF",
      badge: "#5 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Footwear",
      title: "Athletic Running Shoes - Professional",
      originalPrice: "৳17,999",
      salePrice: "৳12,999",
      stockLeft: 15,
      rating: 4.7,
      reviews: 892,
      discount: "28% OFF",
      badge: "#6 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Designer Sunglasses - Premium Quality",
      originalPrice: "৳23,999",
      salePrice: "৳16,999",
      stockLeft: 9,
      rating: 4.5,
      reviews: 445,
      discount: "29% OFF",
      badge: "#7 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "Mechanical Gaming Keyboard - RGB",
      originalPrice: "৳14,399",
      salePrice: "৳9,999",
      stockLeft: 18,
      rating: 4.8,
      reviews: 567,
      discount: "31% OFF",
      badge: "#8 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Kitchen",
      title: "Smart Coffee Maker - App Controlled",
      originalPrice: "৳26,399",
      salePrice: "৳18,999",
      stockLeft: 6,
      rating: 4.4,
      reviews: 334,
      discount: "28% OFF",
      badge: "#9 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      category: "Office",
      title: "Adjustable Laptop Stand - Ergonomic",
      originalPrice: "৳12,799",
      salePrice: "৳8,999",
      stockLeft: 22,
      rating: 4.6,
      reviews: 298,
      discount: "30% OFF",
      badge: "#10 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
      category: "Home",
      title: "Robot Vacuum Cleaner - Smart Navigation",
      originalPrice: "৳59,999",
      salePrice: "৳41,999",
      stockLeft: 7,
      rating: 4.7,
      reviews: 456,
      discount: "30% OFF",
      badge: "#11 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
      category: "Kitchen",
      title: "Air Fryer XL - 8 Quart Capacity",
      originalPrice: "৳23,999",
      salePrice: "৳16,799",
      stockLeft: 11,
      rating: 4.6,
      reviews: 789,
      discount: "30% OFF",
      badge: "#12 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Studio Monitor Speakers - Professional",
      originalPrice: "৳47,999",
      salePrice: "৳33,999",
      stockLeft: 4,
      rating: 4.8,
      reviews: 234,
      discount: "29% OFF",
      badge: "#13 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Photography",
      title: "DSLR Camera - 24MP Full Frame",
      originalPrice: "৳155,999",
      salePrice: "৳119,999",
      stockLeft: 3,
      rating: 4.9,
      reviews: 567,
      discount: "23% OFF",
      badge: "#14 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613540-996a8c044e55?w=300&h=300&fit=crop",
      category: "Fitness",
      title: "Smart Exercise Bike - Interactive Training",
      originalPrice: "৳179,999",
      salePrice: "৳129,999",
      stockLeft: 2,
      rating: 4.7,
      reviews: 345,
      discount: "28% OFF",
      badge: "#15 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      category: "Transportation",
      title: "Electric Bike - 50 Mile Range",
      originalPrice: "৳239,999",
      salePrice: "৳179,999",
      stockLeft: 1,
      rating: 4.6,
      reviews: 198,
      discount: "25% OFF",
      badge: "#16 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=300&fit=crop",
      category: "Beauty",
      title: "LED Light Therapy Mask - Anti-Aging",
      originalPrice: "৳35,999",
      salePrice: "৳24,999",
      stockLeft: 8,
      rating: 4.5,
      reviews: 267,
      discount: "31% OFF",
      badge: "#17 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Designer Watch - Automatic Movement",
      originalPrice: "৳95,999",
      salePrice: "৳67,999",
      stockLeft: 5,
      rating: 4.8,
      reviews: 178,
      discount: "29% OFF",
      badge: "#18 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&h=300&fit=crop",
      category: "Tools",
      title: "Cordless Drill Set - 20V Battery",
      originalPrice: "৳19,199",
      salePrice: "৳13,999",
      stockLeft: 14,
      rating: 4.4,
      reviews: 456,
      discount: "27% OFF",
      badge: "#19 SELLER"
    },
    {
      image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=300&h=300&fit=crop",
      category: "Fitness",
      title: "Smart Treadmill - Interactive Display",
      originalPrice: "৳199,999",
      salePrice: "৳149,999",
      stockLeft: 2,
      rating: 4.7,
      reviews: 289,
      discount: "25% OFF",
      badge: "#20 SELLER"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Top Selling Products</h2>
              <p className="text-gray-600">Most loved by our customers</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all">
            <TrendingUp className="w-4 h-4" /> View Rankings
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
              onAddToCart={() => console.log(`Added top selling product ${index + 1} to cart`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
