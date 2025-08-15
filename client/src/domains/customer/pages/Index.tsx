
import React from 'react';

import { FeaturedCategories } from '../home/homepage/FeaturedCategories';
import { FlashSaleSection } from '../home/homepage/FlashSaleSection';
import { PromotionalBanners } from '../home/homepage/PromotionalBanners';
import { MegaSaleSection } from '../home/homepage/MegaSaleSection';
import { TrendingProducts } from '../home/homepage/TrendingProducts';
import { NewProductsSection } from '../home/homepage/NewProductsSection';
import { RecommendedSection } from '../home/homepage/RecommendedSection';
import { TopSellingSection } from '../home/homepage/TopSellingSection';
import { VendorCTA } from '../home/homepage/VendorCTA';
import { TrustIndicators } from '../home/homepage/TrustIndicators';
import { BangladeshFeatures } from '../home/homepage/BangladeshFeatures';
import { QuickAccessIcons } from '../home/homepage/QuickAccessIcons';

import { HeroSection } from '../home/homepage/heroSection';
import QuickAccessFeatures from '../home/homepage/QuickAccessFeatures';
import CategoryQuickBrowser from '../home/homepage/CategoryQuickBrowser';
import { useSEO } from '@/shared/hooks/useSEO';

// Phase 1 Week 3-4 Component Modernization - Amazon.com/Shopee.sg Level

import ProductGrid from '@/shared/modernization/phase1/ProductGrid';


// import LiveShoppingStreams from './modernization/phase1/LiveShoppingStreams'; // TEMPORARILY DISABLED DURING PHASE 1 RESTRUCTURING
// import SocialCommerceIntegration from './modernization/phase1/SocialCommerceIntegration'; // TEMPORARILY DISABLED DURING PHASE 1 RESTRUCTURING

const Index: React.FC = () => {

  // SEO optimization for homepage
  useSEO({
    title: 'GetIt - Bangladesh\'s Leading Multi-Vendor Ecommerce Platform | Online Shopping',
    description: 'Shop from thousands of verified vendors on GetIt Bangladesh. Electronics, Fashion, Home & Garden, Books and more. Best prices, fast delivery, secure payments across Bangladesh.',
    keywords: 'online shopping bangladesh, ecommerce, multi-vendor marketplace, electronics, fashion, home garden, books, getit, bengali shopping, dhaka delivery, trusted vendors',
    canonical: 'https://getit-bangladesh.com/',
    ogType: 'website',
    ogImage: 'https://getit-bangladesh.com/images/homepage-banner.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "GetIt Bangladesh",
      "url": "https://getit-bangladesh.com",
      "description": "Bangladesh's leading multi-vendor ecommerce platform offering electronics, fashion, home & garden products with fast delivery",
      "publisher": {
        "@type": "Organization",
        "name": "GetIt Bangladesh",
        "logo": {
          "@type": "ImageObject",
          "url": "https://getit-bangladesh.com/logo.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://getit-bangladesh.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  });

  return (
    <>
      {/* Hero Section with Bangladesh Festival Content */}
      <HeroSection />
        


        
        {/* Shopee-Style Quick Access Features */}
        <QuickAccessFeatures />
        
        {/* Shopee-Style Category Browser */}
        <CategoryQuickBrowser />
        
        {/* Deal of the Day - Vibrant Gold & Orange & Red */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Deal of the Day ⏰" 
            products={[
              { id: 301, name: "Gaming Laptop RTX 4070", price: 85000, originalPrice: 120000, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&h=200&fit=crop", discount: 29, badge: "TODAY" },
              { id: 302, name: "Wireless Noise Cancelling Headphones", price: 12000, originalPrice: 18000, rating: 4.7, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", discount: 33 },
              { id: 303, name: "Smart Watch Series 9", price: 32000, originalPrice: 45000, rating: 4.9, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop", discount: 29 },
              { id: 304, name: "4K Action Camera", price: 15000, originalPrice: 22000, rating: 4.6, image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200&h=200&fit=crop", discount: 32 },
              { id: 305, name: "Bluetooth Speaker Premium", price: 8500, originalPrice: 12000, rating: 4.8, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop", discount: 29 },
              { id: 306, name: "Tablet 10.9 inch 256GB", price: 38000, originalPrice: 52000, rating: 4.7, image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop", discount: 27 },
              { id: 307, name: "Wireless Charging Pad", price: 2200, originalPrice: 3500, rating: 4.5, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop", discount: 37 },
              { id: 308, name: "Electric Scooter", price: 45000, originalPrice: 65000, rating: 4.6, image: "https://images.unsplash.com/photo-1558618666-e5c43c7dc3ab?w=200&h=200&fit=crop", discount: 31 }
            ]}
            category="electronics"
          />
        </div>

        {/* Mega Sale - Electric Blue & Cyan & Indigo */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Mega Sale 🔥" 
            products={[
              { id: 316, name: "OLED TV 55 inch Smart", price: 65000, originalPrice: 95000, rating: 4.9, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop", discount: 32, badge: "MEGA" },
              { id: 317, name: "Refrigerator Double Door", price: 85000, originalPrice: 120000, rating: 4.8, image: "https://images.unsplash.com/photo-1571175351734-79a6cd2c9fb4?w=200&h=200&fit=crop", discount: 29 },
              { id: 318, name: "Washing Machine Front Load", price: 55000, originalPrice: 75000, rating: 4.7, image: "https://images.unsplash.com/photo-1558618666-e5c43c7dc3ab?w=200&h=200&fit=crop", discount: 27 },
              { id: 319, name: "Air Conditioner 1.5 Ton", price: 38000, originalPrice: 52000, rating: 4.6, image: "https://images.unsplash.com/photo-1558618666-e5c43c7dc3ab?w=200&h=200&fit=crop", discount: 27 },
              { id: 320, name: "Microwave Oven 25L", price: 12000, originalPrice: 16000, rating: 4.5, image: "https://images.unsplash.com/photo-1556909114-c03044b4b6e2?w=200&h=200&fit=crop", discount: 25 },
              { id: 321, name: "Vacuum Cleaner Robot", price: 18000, originalPrice: 26000, rating: 4.8, image: "https://images.unsplash.com/photo-1558618666-e0c34851f30d?w=200&h=200&fit=crop", discount: 31 },
              { id: 322, name: "Electric Kettle Smart", price: 3500, originalPrice: 5000, rating: 4.4, image: "https://images.unsplash.com/photo-1544306094-2ac7c2df4b8c?w=200&h=200&fit=crop", discount: 30 },
              { id: 323, name: "Induction Cooktop", price: 4500, originalPrice: 6500, rating: 4.6, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop", discount: 31 }
            ]}
            category="appliances"
          />
        </div>

        {/* Just Arrived - Fresh Green & Mint & Lime */}
        {/* Amazon.com/Shopee.sg-Level Live Shopping Streams - TEMPORARILY DISABLED DURING PHASE 1 RESTRUCTURING */}
        {/* <div className="max-w-7xl mx-auto px-4 py-6">
          <LiveShoppingStreams />
        </div> */}

        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Just Arrived ✨" 
            products={[
              { id: 331, name: "MacBook Pro M4 Max", price: 185000, originalPrice: 220000, rating: 4.9, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop", discount: 16, badge: "NEW" },
              { id: 332, name: "iPhone 16 Pro Max", price: 145000, originalPrice: 165000, rating: 4.8, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop", discount: 12 },
              { id: 333, name: "Samsung Galaxy S25 Ultra", price: 125000, originalPrice: 145000, rating: 4.7, image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=200&fit=crop", discount: 14 },
              { id: 334, name: "Google Pixel 9 Pro", price: 85000, originalPrice: 95000, rating: 4.6, image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=200&fit=crop", discount: 11 },
              { id: 335, name: "Sony WH-1000XM6", price: 28000, originalPrice: 32000, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", discount: 13 },
              { id: 336, name: "AirPods Pro 3rd Gen", price: 22000, originalPrice: 26000, rating: 4.7, image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=200&h=200&fit=crop", discount: 15 },
              { id: 337, name: "Apple Watch Series 10", price: 45000, originalPrice: 52000, rating: 4.9, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop", discount: 13 },
              { id: 338, name: "iPad Pro M4 11-inch", price: 95000, originalPrice: 108000, rating: 4.8, image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop", discount: 12 },

            ]}
            category="devices"
          />
        </div>

        {/* Trending Recently - Vibrant Purple & Magenta & Fuchsia */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Trending Recently 🔥" 
            products={[
              { id: 346, name: "Tesla Model Y Accessories Kit", price: 15000, originalPrice: 20000, rating: 4.8, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=200&fit=crop", discount: 25, badge: "HOT" },
              { id: 347, name: "Smart Home Hub Pro", price: 18000, originalPrice: 25000, rating: 4.7, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop", discount: 28 },
              { id: 348, name: "Wireless Charging Station", price: 6500, originalPrice: 9000, rating: 4.6, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop", discount: 28 },
              { id: 349, name: "Smart Ring Health Tracker", price: 32000, originalPrice: 42000, rating: 4.9, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200&h=200&fit=crop", discount: 24 },
              { id: 350, name: "AR Glasses Beta", price: 85000, originalPrice: 115000, rating: 4.5, image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=200&h=200&fit=crop", discount: 26 },
              { id: 351, name: "Foldable Phone Stand", price: 3500, originalPrice: 5000, rating: 4.8, image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=200&h=200&fit=crop", discount: 30 },
              { id: 352, name: "Portable Monitor 15.6", price: 22000, originalPrice: 28000, rating: 4.6, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop", discount: 21 },
              { id: 353, name: "Mechanical Keyboard RGB", price: 12000, originalPrice: 16000, rating: 4.7, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop", discount: 25 },

            ]}
            category="accessories"
          />
        </div>

        {/* Top Rated Products - Elegant Rose Gold & Silver */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Top Rated Products ⭐" 
            products={[
              { id: 361, name: "Premium Coffee Machine", price: 85000, originalPrice: 95000, rating: 4.9, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop", discount: 11, badge: "5⭐" },
              { id: 362, name: "Smart Refrigerator 500L", price: 125000, originalPrice: 145000, rating: 4.8, image: "https://images.unsplash.com/photo-1571175351734-79a6cd2c9fb4?w=200&h=200&fit=crop", discount: 14 },
              { id: 363, name: "Luxury Bedding Set", price: 15000, originalPrice: 20000, rating: 4.9, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=200&fit=crop", discount: 25 },
              { id: 364, name: "Massage Chair Full Body", price: 185000, originalPrice: 220000, rating: 4.8, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop", discount: 16 },
              { id: 365, name: "Air Purifier Premium", price: 32000, originalPrice: 38000, rating: 4.9, image: "https://images.unsplash.com/photo-1558618666-e5c43c7dc3ab?w=200&h=200&fit=crop", discount: 16 },
              { id: 366, name: "Smart Thermostat", price: 12000, originalPrice: 15000, rating: 4.8, image: "https://images.unsplash.com/photo-1558618666-e5c43c7dc3ab?w=200&h=200&fit=crop", discount: 20 },
              { id: 367, name: "Luxury Skincare Set", price: 8500, originalPrice: 12000, rating: 4.9, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop", discount: 29 },
              { id: 368, name: "Premium Vitamins Pack", price: 4500, originalPrice: 6000, rating: 4.8, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop", discount: 25 },

            ]}
            category="lifestyle"
          />
        </div>
        
        {/* Flash Sale Products - Bright Red */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="Flash Sale ⚡" 
            products={[
              { id: 1, name: "Samsung Galaxy A54 5G", price: 35000, originalPrice: 42000, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop", discount: 17, badge: "Hot" },
              { id: 2, name: "iPhone 14 Pro Max", price: 135000, originalPrice: 155000, rating: 4.8, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop", discount: 13 },
              { id: 3, name: "Sony WH-1000XM4", price: 25000, originalPrice: 32000, rating: 4.7, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", discount: 22 },
              { id: 4, name: "MacBook Air M2", price: 120000, originalPrice: 140000, rating: 4.9, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop", discount: 14 },
              { id: 5, name: "Apple Watch Series 9", price: 45000, originalPrice: 52000, rating: 4.6, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop", discount: 13 },
              { id: 6, name: "iPad Pro 11-inch", price: 85000, originalPrice: 95000, rating: 4.8, image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop", discount: 11 },
              { id: 7, name: "Nintendo Switch OLED", price: 28000, originalPrice: 35000, rating: 4.6, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop", discount: 20, badge: "Sale" },
              { id: 8, name: "PS5 Console", price: 55000, originalPrice: 65000, rating: 4.9, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop", discount: 15 },

            ]}
            category="gaming"
          />
        </div>

        

        

        {/* New Arrivals - Orange Theme */}
        {/* Amazon.com/Shopee.sg-Level Product Grid - Enhanced with Modern Features */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGrid 
            title="New Arrivals ✨" 
            products={[
              { id: 46, name: "Smart Home Camera", price: 5500, rating: 4.5, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop", badge: "New" },
              { id: 47, name: "Coffee Maker Automatic", price: 8500, rating: 4.6, image: "https://images.unsplash.com/photo-1545779820-dc841f76b487?w=200&h=200&fit=crop", badge: "New" },
              { id: 48, name: "Gaming Keyboard RGB", price: 3800, rating: 4.4, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop", badge: "New" },
              { id: 49, name: "Air Purifier HEPA", price: 12000, rating: 4.7, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop", badge: "New" },
              { id: 50, name: "Electric Kettle Steel", price: 2200, rating: 4.3, image: "https://images.unsplash.com/photo-1594385208974-d55954c7c7ad?w=200&h=200&fit=crop", badge: "New" },
              { id: 51, name: "Desk Lamp LED", price: 1800, rating: 4.5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", badge: "New" },
              { id: 52, name: "Robot Vacuum Smart", price: 15000, originalPrice: 20000, rating: 4.6, image: "https://images.unsplash.com/photo-1558618666-e0c34851f30d?w=200&h=200&fit=crop", discount: 25, badge: "New" },
              { id: 53, name: "Wireless Doorbell HD", price: 2800, originalPrice: 3500, rating: 4.4, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop", discount: 20, badge: "New" },

            ]}
            category="newarrivals"
          />
        </div>
        







        {/* Amazon.com/Shopee.sg-Level Social Commerce Integration */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* <SocialCommerceIntegration /> - TEMPORARILY DISABLED DURING PHASE 1 RESTRUCTURING */}
        </div>
    </>
  );
};

export default Index;
