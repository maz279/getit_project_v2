/**
 * ProductDiscoveryEngine - Amazon.com/Shopee.sg-Level Product Discovery
 * Advanced AI-powered product discovery with personalization
 */

import React, { useState, useEffect } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, Eye, TrendingUp, Zap, Target, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useSEO } from '@/shared/hooks/useSEO';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  vendor: string;
  badges: string[];
  discount?: number;
  shipping: string;
  location: string;
}

interface DiscoverySection {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: Product[];
  algorithm: string;
}

export const ProductDiscoveryEngine: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(false);

  // SEO optimization
  useSEO({
    title: 'Discover Products - AI-Powered Shopping | GetIt Bangladesh',
    description: 'Discover amazing products with our AI-powered recommendation engine. Find trending items, personalized suggestions, and best deals in Bangladesh.',
    keywords: 'product discovery, AI shopping, personalized recommendations, trending products, best deals, bangladesh shopping'
  });

  // Mock discovery sections - in real app, these would come from AI/ML service
  const discoverySections: DiscoverySection[] = [
    {
      title: 'Recommended For You',
      subtitle: 'Based on your browsing history and preferences',
      icon: <Brain className="h-5 w-5 text-purple-600" />,
      algorithm: 'Collaborative Filtering + Deep Learning',
      products: [
        {
          id: '1',
          name: 'Samsung Galaxy S24 Ultra',
          price: 135000,
          originalPrice: 150000,
          rating: 4.8,
          reviews: 1234,
          image: '/api/placeholder/300/300',
          category: 'Electronics',
          vendor: 'Tech Store BD',
          badges: ['Best Seller', 'Fast Delivery', 'Warranty'],
          discount: 10,
          shipping: 'Free',
          location: 'Dhaka'
        },
        {
          id: '2',
          name: 'Apple iPhone 15 Pro',
          price: 165000,
          rating: 4.9,
          reviews: 856,
          image: '/api/placeholder/300/300',
          category: 'Electronics',
          vendor: 'Premium Electronics',
          badges: ['Premium', 'Authentic', 'Limited Stock'],
          shipping: 'Free',
          location: 'Dhaka'
        }
      ]
    },
    {
      title: 'Trending Now',
      subtitle: 'Most popular items this week',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      algorithm: 'Real-time Popularity + Social Signals',
      products: [
        {
          id: '3',
          name: 'Wireless Bluetooth Headphones',
          price: 2500,
          originalPrice: 3500,
          rating: 4.6,
          reviews: 432,
          image: '/api/placeholder/300/300',
          category: 'Electronics',
          vendor: 'Audio World',
          badges: ['Trending', 'Best Value'],
          discount: 28,
          shipping: 'Free',
          location: 'Chittagong'
        },
        {
          id: '4',
          name: 'Smart Watch Series 9',
          price: 15000,
          rating: 4.7,
          reviews: 678,
          image: '/api/placeholder/300/300',
          category: 'Electronics',
          vendor: 'Smart Devices',
          badges: ['New Arrival', 'Hot Deal'],
          shipping: '৳60',
          location: 'Sylhet'
        }
      ]
    },
    {
      title: 'Flash Deals',
      subtitle: 'Limited time offers ending soon',
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      algorithm: 'Time-sensitive Promotions',
      products: [
        {
          id: '5',
          name: 'Premium Cotton T-Shirt',
          price: 599,
          originalPrice: 1200,
          rating: 4.5,
          reviews: 234,
          image: '/api/placeholder/300/300',
          category: 'Fashion',
          vendor: 'Fashion Hub',
          badges: ['Flash Deal', '50% Off'],
          discount: 50,
          shipping: 'Free',
          location: 'Dhaka'
        },
        {
          id: '6',
          name: 'Kitchen Appliance Set',
          price: 8500,
          originalPrice: 12000,
          rating: 4.4,
          reviews: 167,
          image: '/api/placeholder/300/300',
          category: 'Home & Kitchen',
          vendor: 'Home Essentials',
          badges: ['Limited Time', 'Bundle Deal'],
          discount: 29,
          shipping: 'Free',
          location: 'Dhaka'
        }
      ]
    },
    {
      title: 'Smart Suggestions',
      subtitle: 'AI-curated picks based on your lifestyle',
      icon: <Sparkles className="h-5 w-5 text-blue-600" />,
      algorithm: 'Lifestyle Analysis + Predictive AI',
      products: [
        {
          id: '7',
          name: 'Fitness Tracker Pro',
          price: 4500,
          rating: 4.6,
          reviews: 543,
          image: '/api/placeholder/300/300',
          category: 'Health & Fitness',
          vendor: 'Fitness Zone',
          badges: ['Health Tech', 'Popular'],
          shipping: 'Free',
          location: 'Dhaka'
        },
        {
          id: '8',
          name: 'Organic Skincare Set',
          price: 1800,
          rating: 4.7,
          reviews: 298,
          image: '/api/placeholder/300/300',
          category: 'Beauty & Personal Care',
          vendor: 'Natural Beauty',
          badges: ['Organic', 'Bestseller'],
          shipping: '৳50',
          location: 'Chittagong'
        }
      ]
    }
  ];

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{product.discount}%
            </Badge>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium ml-1">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-blue-600">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {product.badges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
        
        <div className="text-sm text-gray-500 mb-3">
          <div>Shipping: {product.shipping}</div>
          <div>From: {product.location}</div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DiscoverySection: React.FC<{ section: DiscoverySection }> = ({ section }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {section.icon}
            <h2 className="text-2xl font-bold">{section.title}</h2>
          </div>
          <p className="text-gray-600">{section.subtitle}</p>
          <p className="text-sm text-blue-600 mt-1">Algorithm: {section.algorithm}</p>
        </div>
        <Button variant="outline">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {section.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Discovery Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Product Discovery
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products tailored just for you with our advanced AI recommendation engine
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Discovery Sections */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="deals">Flash Deals</TabsTrigger>
            <TabsTrigger value="smart">Smart Picks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-8">
            {discoverySections.map((section, index) => (
              <DiscoverySection key={index} section={section} />
            ))}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-8">
            <DiscoverySection section={discoverySections[0]} />
          </TabsContent>
          
          <TabsContent value="trending" className="mt-8">
            <DiscoverySection section={discoverySections[1]} />
          </TabsContent>
          
          <TabsContent value="deals" className="mt-8">
            <DiscoverySection section={discoverySections[2]} />
          </TabsContent>
          
          <TabsContent value="smart" className="mt-8">
            <DiscoverySection section={discoverySections[3]} />
          </TabsContent>
        </Tabs>
        
        {/* AI Insights Panel */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              AI Shopping Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">89%</div>
                <div className="text-sm text-gray-600">Recommendation Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">2.5x</div>
                <div className="text-sm text-gray-600">Higher Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">4.8/5</div>
                <div className="text-sm text-gray-600">User Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDiscoveryEngine;