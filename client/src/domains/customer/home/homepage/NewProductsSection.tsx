import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const NewProductsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/categories?filter=new');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const products = [
    {
      id: 'new-1',
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: "Watches",
      title: "Smart Fitness Watch - Heart Rate Monitor",
      originalPrice: "৳27,599",
      salePrice: "৳0", // MOCK DATA REMOVED - USE DATABASE
      stockLeft: 8,
      rating: 4.7,
      reviews: 156,
      discount: "22% OFF",
      badge: "NEW"
    },
    {
      id: 'new-2',
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Wireless Noise Cancelling Headphones",
      originalPrice: "৳23,999",
      salePrice: "৳17,999",
      stockLeft: 12,
      rating: 4.6,
      reviews: 243,
      discount: "25% OFF",
      badge: "NEW"
    },
    {
      id: 'new-3',
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Gaming",
      title: "RGB Gaming Keyboard - Mechanical Keys",
      originalPrice: "৳14,399",
      salePrice: "৳10,799",
      stockLeft: 15,
      rating: 4.8,
      reviews: 187,
      discount: "25% OFF",
      badge: "NEW"
    },
    {
      id: 'new-4',
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      category: "Fashion",
      title: "Designer Sunglasses - UV Protection",
      originalPrice: "৳19,199",
      salePrice: "৳14,399",
      stockLeft: 6,
      rating: 4.5,
      reviews: 98,
      discount: "25% OFF",
      badge: "NEW"
    },
    {
      id: 'new-5',
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Sports",
      title: "Professional Running Shoes",
      originalPrice: "৳17,999",
      salePrice: "৳13,199",
      stockLeft: 9,
      rating: 4.7,
      reviews: 321,
      discount: "27% OFF",
      badge: "NEW"
    },
    {
      id: 'new-6',
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      category: "Home",
      title: "Smart Coffee Maker - WiFi Enabled",
      originalPrice: "৳26,399",
      salePrice: "৳20,399",
      stockLeft: 4,
      rating: 4.4,
      reviews: 134,
      discount: "23% OFF",
      badge: "NEW"
    },
    {
      id: 'new-7',
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      category: "Tech",
      title: "Adjustable Laptop Stand - Ergonomic",
      originalPrice: "৳10,799",
      salePrice: "৳7,799",
      stockLeft: 18,
      rating: 4.6,
      reviews: 205,
      discount: "28% OFF",
      badge: "NEW"
    },
    {
      id: 'new-8',
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      category: "Mobile",
      title: "Fast Wireless Charging Pad",
      originalPrice: "৳8,399",
      salePrice: "৳5,999",
      stockLeft: 22,
      rating: 4.3,
      reviews: 167,
      discount: "29% OFF",
      badge: "NEW"
    },
    {
      id: 'new-9',
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      category: "Photography",
      title: "DSLR Camera Lens - 50mm Prime",
      originalPrice: "৳35,999",
      salePrice: "৳25,999",
      stockLeft: 5,
      rating: 4.9,
      reviews: 89,
      discount: "28% OFF",
      badge: "NEW"
    },
    {
      id: 'new-10',
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
      category: "Audio",
      title: "Professional Studio Speakers",
      originalPrice: "৳47,999",
      salePrice: "৳35,999",
      stockLeft: 3,
      rating: 4.8,
      reviews: 67,
      discount: "25% OFF",
      badge: "NEW"
    },
    {
      id: 'new-11',
      image: "https://images.unsplash.com/photo-1571019613540-996a8c044e55?w=300&h=300&fit=crop",
      category: "Fitness",
      title: "Smart Exercise Bike - Connected",
      originalPrice: "৳119,999",
      salePrice: "৳0", // MOCK DATA REMOVED
      stockLeft: 2,
      rating: 4.6,
      reviews: 234,
      discount: "25% OFF",
      badge: "NEW"
    },
    {
      id: 'new-12',
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=300&fit=crop",
      category: "Beauty",
      title: "LED Light Therapy Device",
      originalPrice: "৳29,999",
      salePrice: "৳19,999",
      stockLeft: 8,
      rating: 4.5,
      reviews: 156,
      discount: "33% OFF",
      badge: "NEW"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">New Products</h2>
              <p className="text-gray-600">Fresh arrivals just for you</p>
            </div>
          </div>
          <button 
            onClick={handleViewAll}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
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
              onAddToCart={() => console.log(`Added new product ${index + 1} to cart`)}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
