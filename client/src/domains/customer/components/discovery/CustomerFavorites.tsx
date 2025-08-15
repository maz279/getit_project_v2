
import React from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { Heart, Users } from 'lucide-react';

export const CustomerFavorites: React.FC = () => {
  const favoriteProducts = [
    {
      id: 'fav-1',
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Wearables",
      title: "Smart Fitness Tracker with Heart Monitor",
      originalPrice: "৳19,999",
      salePrice: "৳14,999",
      stockLeft: 18,
      rating: 4.8,
      reviews: 567,
      discount: "25% OFF",
      badge: "FAVORITE",
      wishlistCount: 1234
    },
    {
      id: 'fav-2',
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      category: "Tech",
      title: "Ergonomic Laptop Stand with Cooling",
      originalPrice: "৳8,999",
      salePrice: "৳5,999",
      stockLeft: 22,
      rating: 4.7,
      reviews: 789,
      discount: "33% OFF",
      badge: "FAVORITE",
      wishlistCount: 856
    },
    {
      id: 'fav-3',
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Footwear",
      title: "Premium Running Shoes - Limited Edition",
      originalPrice: "৳24,999",
      salePrice: "৳17,999",
      stockLeft: 9,
      rating: 4.9,
      reviews: 432,
      discount: "28% OFF",
      badge: "FAVORITE",
      wishlistCount: 967
    },
    {
      id: 'fav-4',
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Wireless Earbuds with Active Noise Cancellation",
      originalPrice: "৳16,999",
      salePrice: "৳11,999",
      stockLeft: 14,
      rating: 4.8,
      reviews: 678,
      discount: "29% OFF",
      badge: "FAVORITE",
      wishlistCount: 1145
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">💖 Customer Favorites - New Arrivals</h2>
          <p className="text-gray-600 text-lg">New products that customers are loving the most</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg flex items-center gap-1">
                <Users className="w-3 h-3" />
                {product.wishlistCount}
              </div>
              <div className="absolute -top-1 -left-1 bg-pink-400 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                ❤️ Loved
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
