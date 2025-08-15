
import React from 'react';
import { ProductCard } from './ProductCard';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const MixedProductsSection: React.FC = () => {
  const mixedProducts = [
    // Electronics
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      category: "Electronics",
      title: "Premium Smartwatch with Health Monitoring",
      originalPrice: "$349.99",
      salePrice: "$279.99",
      stockLeft: 12,
      rating: 4.8,
      reviews: 456
    },
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      category: "Audio",
      title: "Wireless Over-Ear Headphones - Studio Quality",
      originalPrice: "$299.99",
      salePrice: "$199.99",
      stockLeft: 8,
      rating: 4.7,
      reviews: 324
    },
    {
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      category: "Mobile",
      title: "Flagship Smartphone 256GB - Latest Model",
      originalPrice: "$899.99",
      salePrice: "$749.99",
      stockLeft: 5,
      rating: 4.9,
      reviews: 1234
    },
    {
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      category: "Computing",
      title: "Ultra-Thin Laptop 15.6\" - Professional Grade",
      originalPrice: "$1299.99",
      salePrice: "$999.99",
      stockLeft: 3,
      rating: 4.6,
      reviews: 789
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
      category: "Gaming",
      title: "Mechanical Gaming Keyboard RGB Backlit",
      originalPrice: "$149.99",
      salePrice: "$99.99",
      stockLeft: 18,
      rating: 4.8,
      reviews: 567
    },
    // Fashion & Accessories
    {
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      category: "Fashion",
      title: "Designer Polarized Sunglasses - Premium",
      originalPrice: "$189.99",
      salePrice: "$129.99",
      stockLeft: 14,
      rating: 4.5,
      reviews: 298
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      category: "Footwear",
      title: "Athletic Running Shoes - Performance Series",
      originalPrice: "$179.99",
      salePrice: "$129.99",
      stockLeft: 22,
      rating: 4.7,
      reviews: 892
    },
    {
      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400",
      category: "Wearables",
      title: "Fitness Tracker with Heart Rate Monitor",
      originalPrice: "$199.99",
      salePrice: "$149.99",
      stockLeft: 16,
      rating: 4.4,
      reviews: 445
    },
    // Home & Living
    {
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
      category: "Kitchen",
      title: "Smart Coffee Machine - App Controlled",
      originalPrice: "$249.99",
      salePrice: "$179.99",
      stockLeft: 7,
      rating: 4.6,
      reviews: 234
    },
    {
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      category: "Home Decor",
      title: "Modern Table Lamp with Wireless Charging",
      originalPrice: "$89.99",
      salePrice: "$64.99",
      stockLeft: 11,
      rating: 4.3,
      reviews: 178
    },
    // Sports & Outdoors
    {
      image: "https://images.unsplash.com/photo-1571019613540-996a8c044e55?w=400",
      category: "Fitness",
      title: "Adjustable Dumbbell Set - Home Gym",
      originalPrice: "$299.99",
      salePrice: "$219.99",
      stockLeft: 9,
      rating: 4.8,
      reviews: 456
    },
    {
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
      category: "Outdoor",
      title: "Waterproof Hiking Backpack 40L",
      originalPrice: "$129.99",
      salePrice: "$89.99",
      stockLeft: 13,
      rating: 4.5,
      reviews: 321
    },
    // Health & Beauty
    {
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
      category: "Beauty",
      title: "Professional Hair Dryer - Ionic Technology",
      originalPrice: "$159.99",
      salePrice: "$119.99",
      stockLeft: 6,
      rating: 4.4,
      reviews: 267
    },
    {
      image: "https://images.unsplash.com/photo-1587486937533-0bfd33bed0b8?w=400",
      category: "Health",
      title: "Digital Blood Pressure Monitor",
      originalPrice: "$79.99",
      salePrice: "$59.99",
      stockLeft: 15,
      rating: 4.6,
      reviews: 189
    },
    // Books & Media
    {
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      category: "Books",
      title: "Bestseller Novel Collection - 5 Books",
      originalPrice: "$89.99",
      salePrice: "$49.99",
      stockLeft: 25,
      rating: 4.7,
      reviews: 156
    },
    // Automotive
    {
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400",
      category: "Automotive",
      title: "Wireless Car Charger with Phone Mount",
      originalPrice: "$69.99",
      salePrice: "$44.99",
      stockLeft: 19,
      rating: 4.3,
      reviews: 298
    },
    // Baby & Kids
    {
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
      category: "Baby",
      title: "Baby Monitor with Video - Smart Features",
      originalPrice: "$199.99",
      salePrice: "$149.99",
      stockLeft: 8,
      rating: 4.8,
      reviews: 345
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category: "Toys",
      title: "Educational Building Blocks Set - STEM",
      originalPrice: "$59.99",
      salePrice: "$39.99",
      stockLeft: 21,
      rating: 4.6,
      reviews: 234
    },
    // Pet Supplies
    {
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      category: "Pets",
      title: "Automatic Pet Feeder - Smart Schedule",
      originalPrice: "$119.99",
      salePrice: "$89.99",
      stockLeft: 12,
      rating: 4.5,
      reviews: 178
    },
    // Office & Business
    {
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
      category: "Office",
      title: "Ergonomic Office Chair - Premium Comfort",
      originalPrice: "$349.99",
      salePrice: "$249.99",
      stockLeft: 4,
      rating: 4.7,
      reviews: 423
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Mixed Categories</h2>
              <p className="text-gray-600">Explore products from all categories</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mixedProducts.map((product, index) => (
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
              discount={`${Math.floor(Math.random() * 30) + 15}% OFF`}
              badge="MIXED"
              onAddToCart={() => console.log(`Added mixed product ${index + 1} to cart`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
