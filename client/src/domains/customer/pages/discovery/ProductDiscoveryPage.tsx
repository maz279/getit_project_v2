import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Star, 
  Heart, 
  ShoppingCart, 
  Filter,
  Grid,
  List,
  Eye,
  ChevronRight,
  Zap,
  Crown,
  Fire,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import customerService from '@/shared/services/customer/customerService';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  vendor: { name: string; verified: boolean };
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
  discount?: number;
  soldCount?: number;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  trending: boolean;
}

const ProductDiscoveryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  // Fetch discovery data
  const { data: trendingProducts } = useQuery({
    queryKey: ['discovery', 'trending'],
    queryFn: () => customerService.getTrendingProducts(),
    staleTime: 10 * 60 * 1000
  });

  const { data: newArrivals } = useQuery({
    queryKey: ['discovery', 'new-arrivals'],
    queryFn: () => customerService.getNewArrivals(),
    staleTime: 10 * 60 * 1000
  });

  const { data: flashSales } = useQuery({
    queryKey: ['discovery', 'flash-sales'],
    queryFn: () => customerService.getFlashSales(),
    staleTime: 2 * 60 * 1000
  });

  const { data: personalizedRecommendations } = useQuery({
    queryKey: ['discovery', 'personalized'],
    queryFn: () => customerService.getPersonalizedRecommendations(),
    staleTime: 5 * 60 * 1000
  });

  const { data: categories } = useQuery({
    queryKey: ['discovery', 'categories'],
    queryFn: () => customerService.getTrendingCategories(),
    staleTime: 30 * 60 * 1000
  });

  const { data: bestSellers } = useQuery({
    queryKey: ['discovery', 'best-sellers'],
    queryFn: () => customerService.getBestSellers(),
    staleTime: 15 * 60 * 1000
  });

  const { data: dealOfTheDay } = useQuery({
    queryKey: ['discovery', 'deal-of-day'],
    queryFn: () => customerService.getDealOfTheDay(),
    staleTime: 60 * 60 * 1000
  });

  const ProductCard: React.FC<{ product: Product; featured?: boolean }> = ({ product, featured = false }) => {
    const discount = product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : product.discount || 0;

    const cardSize = featured ? 'lg' : 'md';

    return (
      <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 ${featured ? 'col-span-2' : ''}`}>
        <div className={`relative ${featured ? 'aspect-[2/1]' : 'aspect-square'} overflow-hidden rounded-t-lg`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(`/products/${product.id}`)}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.isNew && <Badge variant="default" className="text-xs">New</Badge>}
            {product.isTrending && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Trending</Badge>}
            {product.isFlashSale && <Badge variant="destructive" className="text-xs animate-pulse">Flash Sale</Badge>}
            {discount > 0 && <Badge variant="destructive" className="text-xs">{discount}% OFF</Badge>}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col space-y-1">
              <Button variant="secondary" size="icon" className="w-8 h-8 bg-white/90">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" className="w-8 h-8 bg-white/90">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Flash Sale Timer (if applicable) */}
          {product.isFlashSale && (
            <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              2h 34m left
            </div>
          )}
        </div>

        <CardContent className={`p-${featured ? '6' : '4'}`}>
          <div className="space-y-2">
            {/* Vendor */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{product.vendor.name}</span>
              {product.vendor.verified && (
                <Badge variant="outline" className="text-xs">Verified</Badge>
              )}
            </div>

            {/* Product Name */}
            <h3 
              className={`font-medium ${featured ? 'text-lg' : 'text-sm'} line-clamp-2 cursor-pointer hover:text-blue-600`}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${featured ? 'w-4 h-4' : 'w-3 h-3'} ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`${featured ? 'text-sm' : 'text-xs'} text-gray-500`}>
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-red-600 ${featured ? 'text-xl' : 'text-base'}`}>
                ৳{product.price.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className={`text-gray-500 line-through ${featured ? 'text-sm' : 'text-xs'}`}>
                  ৳{product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between text-xs">
              {product.soldCount && (
                <span className="text-gray-500">{product.soldCount.toLocaleString()} sold</span>
              )}
              {featured && product.tags && (
                <div className="flex space-x-1">
                  {product.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategoryCard: React.FC<{ category: Category }> = ({ category }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => navigate(`/categories/${category.id}`)}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {category.trending && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs bg-orange-100 text-orange-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>
      <CardContent className="p-4 text-center">
        <h3 className="font-medium">{category.name}</h3>
        <p className="text-sm text-gray-500">{category.productCount.toLocaleString()} products</p>
      </CardContent>
    </Card>
  );

  const SectionHeader: React.FC<{ 
    title: string; 
    subtitle?: string; 
    icon: React.ReactNode; 
    viewAllLink?: string;
    color?: string;
  }> = ({ title, subtitle, icon, viewAllLink, color = 'text-blue-600' }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {viewAllLink && (
        <Button variant="outline" onClick={() => navigate(viewAllLink)}>
          View All
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-12">
      {/* Hero Section with Deal of the Day */}
      {dealOfTheDay && (
        <section className="relative">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <Badge variant="secondary" className="bg-yellow-400 text-black">
                      Deal of the Day
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">
                    {dealOfTheDay.discount}% OFF
                  </h1>
                  <h2 className="text-xl mb-4">{dealOfTheDay.name}</h2>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-3xl font-bold">
                      ৳{dealOfTheDay.price.toLocaleString()}
                    </span>
                    <span className="text-lg line-through opacity-75">
                      ৳{dealOfTheDay.comparePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      size="lg" 
                      className="bg-white text-purple-600 hover:bg-gray-100"
                      onClick={() => navigate(`/products/${dealOfTheDay.id}`)}
                    >
                      Shop Now
                    </Button>
                    <Button variant="outline" size="lg" className="border-white text-white">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Wishlist
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={dealOfTheDay.image}
                    alt={dealOfTheDay.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg text-center">
                    <div className="text-lg font-bold">23:45:12</div>
                    <div className="text-xs">Time Left</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Categories Section */}
      {categories && (
        <section>
          <SectionHeader
            title="Shop by Category"
            subtitle="Discover products across different categories"
            icon={<Grid className="w-6 h-6" />}
            viewAllLink="/categories"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Main Discovery Tabs */}
      <section>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-auto grid-cols-5">
              <TabsTrigger value="trending" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>New Arrivals</span>
              </TabsTrigger>
              <TabsTrigger value="flash" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Flash Sales</span>
              </TabsTrigger>
              <TabsTrigger value="bestsellers" className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Best Sellers</span>
              </TabsTrigger>
              <TabsTrigger value="personalized" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>For You</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="trending">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingProducts?.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  featured={index === 0}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newArrivals?.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  featured={index === 0}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flash">
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fire className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                      Flash Sale Ends Soon!
                    </h3>
                    <p className="text-red-700 dark:text-red-200">Limited time offers</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">02:34:12</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Time Remaining</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {flashSales?.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  featured={index === 0}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bestsellers">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bestSellers?.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  featured={index === 0}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personalized">
            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    Recommended Just for You
                  </h3>
                  <p className="text-purple-700 dark:text-purple-200">
                    Based on your browsing history and preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {personalizedRecommendations?.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  featured={index === 0}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Special Promotions */}
      <section>
        <SectionHeader
          title="Special Offers"
          subtitle="Don't miss out on these amazing deals"
          icon={<Gift className="w-6 h-6" />}
          color="text-green-600"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="mb-4">On orders over ৳1000</p>
              <Button variant="secondary">Shop Now</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Weekend Sale</h3>
              <p className="mb-4">Up to 50% off selected items</p>
              <Button variant="secondary">Explore Deals</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">New Customer</h3>
              <p className="mb-4">Extra 15% off your first order</p>
              <Button variant="secondary">Get Discount</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ProductDiscoveryPage;