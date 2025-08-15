
import React from 'react';
import { ProductCard } from '../homepage/ProductCard';
import { Rocket, Star } from 'lucide-react';

export const RecentlyLaunched: React.FC = () => {
  const recentLaunches = [
    {
      id: 'launch-1',
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Premium Sunglasses Collection 2024",
      originalPrice: "৳14,999",
      salePrice: "৳10,999",
      stockLeft: 12,
      rating: 4.6,
      reviews: 89,
      discount: "27% OFF",
      badge: "LAUNCHED",
      launchDate: "3 days ago"
    },
    {
      id: 'launch-2',
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Home",
      title: "Smart Home Coffee Brewing System",
      originalPrice: "৳34,999",
      salePrice: "৳25,999",
      stockLeft: 8,
      rating: 4.8,
      reviews: 67,
      discount: "26% OFF",
      badge: "LAUNCHED",
      launchDate: "1 week ago"
    },
    {
      id: 'launch-3',
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "Mechanical RGB Gaming Keyboard Pro",
      originalPrice: "৳18,999",
      salePrice: "৳13,999",
      stockLeft: 16,
      rating: 4.9,
      reviews: 123,
      discount: "26% OFF",
      badge: "LAUNCHED",
      launchDate: "5 days ago"
    },
    {
      id: 'launch-4',
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Photography",
      title: "Professional Camera Lens 85mm f/1.4",
      originalPrice: "৳0", // MOCK DATA REMOVED
      salePrice: "৳69,999",
      stockLeft: 4,
      rating: 4.9,
      reviews: 45,
      discount: "22% OFF",
      badge: "LAUNCHED",
      launchDate: "2 days ago"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🚀 Recently Launched Products</h2>
          <p className="text-gray-600 text-lg">Fresh launches from the past week</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentLaunches.map((product, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-3 -right-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                {product.launchDate}
              </div>
              <div className="absolute -top-1 -left-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3" />
                Fresh
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
