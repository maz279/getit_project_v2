
import React from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { Package, Calendar } from 'lucide-react';

export const PreOrderSection: React.FC = () => {
  const preOrderProducts = [
    {
      id: 'pre-1',
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=300&fit=crop",
      category: "Laptops",
      title: "MacBook Pro M3 Max - 16 inch",
      originalPrice: "৳449,999",
      salePrice: "৳419,999",
      stockLeft: 0,
      rating: 4.9,
      reviews: 0,
      discount: "7% OFF",
      badge: "PRE-ORDER",
      releaseDate: "March 15, 2024"
    },
    {
      id: 'pre-2',
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop",
      category: "Smartphones",
      title: "Samsung Galaxy S24 Ultra",
      originalPrice: "৳179,999",
      salePrice: "৳169,999",
      stockLeft: 0,
      rating: 4.8,
      reviews: 0,
      discount: "6% OFF",
      badge: "PRE-ORDER",
      releaseDate: "February 28, 2024"
    },
    {
      id: 'pre-3',
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "PlayStation 5 Pro Console",
      originalPrice: "৳0", // MOCK DATA REMOVED
      salePrice: "৳84,999",
      stockLeft: 0,
      rating: 4.7,
      reviews: 0,
      discount: "6% OFF",
      badge: "PRE-ORDER",
      releaseDate: "April 10, 2024"
    }
  ];

  return (
    <section id="pre-orders" className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📦 Pre-Order New Releases</h2>
          <p className="text-gray-600 text-lg">Be the first to get the latest products - Reserve yours now!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {preOrderProducts.map((product, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-3 -right-3 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                Coming Soon
              </div>
              <div className="absolute -top-1 -left-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {product.releaseDate}
              </div>
              <div className="bg-white rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all">
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
                  onAddToCart={() => console.log(`Pre-ordered ${product.title}`)}
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
