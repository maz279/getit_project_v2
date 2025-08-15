// BrandDirectory.tsx - Amazon.com/Shopee.sg-Level Brand Discovery Page
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Search, Filter, Grid, List, Star, TrendingUp, Award, Globe, Heart, ArrowRight, Package, Users, ShoppingBag, Crown } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  country: string;
  rating: number;
  totalProducts: number;
  followers: number;
  tags: string[];
  established: string;
  verified: boolean;
  trending: boolean;
  premium: boolean;
  bangladeshBased: boolean;
}

const BrandDirectory: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Brand Directory - Discover Top Brands | GetIt Bangladesh',
    description: 'Explore premium brands from Bangladesh and worldwide. Discover electronics, fashion, home goods, and more from verified brand partners.',
    keywords: 'brands, premium brands, electronics brands, fashion brands, Bangladesh brands, international brands'
  });

  // Sample brand data - in real app, fetch from API
  const sampleBrands: Brand[] = [
    {
      id: '1',
      name: 'Samsung',
      logo: '/brands/samsung.png',
      description: 'World leader in electronics and technology innovation',
      category: 'Electronics',
      country: 'South Korea',
      rating: 4.8,
      totalProducts: 2500,
      followers: 125000,
      tags: ['Premium', 'Technology', 'Innovation'],
      established: '1938',
      verified: true,
      trending: true,
      premium: true,
      bangladeshBased: false
    },
    {
      id: '2',
      name: 'Aarong',
      logo: '/brands/aarong.png',
      description: 'Bangladesh\'s finest handicrafts and traditional clothing',
      category: 'Fashion',
      country: 'Bangladesh',
      rating: 4.7,
      totalProducts: 1200,
      followers: 85000,
      tags: ['Traditional', 'Handicraft', 'Local'],
      established: '1978',
      verified: true,
      trending: false,
      premium: true,
      bangladeshBased: true
    },
    {
      id: '3',
      name: 'Apex',
      logo: '/brands/apex.png',
      description: 'Leading footwear and leather goods manufacturer in Bangladesh',
      category: 'Fashion',
      country: 'Bangladesh',
      rating: 4.5,
      totalProducts: 800,
      followers: 45000,
      tags: ['Footwear', 'Leather', 'Local'],
      established: '1990',
      verified: true,
      trending: false,
      premium: false,
      bangladeshBased: true
    },
    {
      id: '4',
      name: 'Apple',
      logo: '/brands/apple.png',
      description: 'Premium technology and lifestyle products',
      category: 'Electronics',
      country: 'USA',
      rating: 4.9,
      totalProducts: 150,
      followers: 200000,
      tags: ['Premium', 'Innovation', 'Lifestyle'],
      established: '1976',
      verified: true,
      trending: true,
      premium: true,
      bangladeshBased: false
    },
    {
      id: '5',
      name: 'Unilever',
      logo: '/brands/unilever.png',
      description: 'Global consumer goods leader with strong Bangladesh presence',
      category: 'Home & Garden',
      country: 'Bangladesh',
      rating: 4.4,
      totalProducts: 950,
      followers: 62000,
      tags: ['Consumer Goods', 'Daily Essentials', 'Trusted'],
      established: '1964',
      verified: true,
      trending: false,
      premium: false,
      bangladeshBased: true
    }
  ];

  const categories = [
    'all', 'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Food & Beverages',
    'Automotive', 'Industrial', 'Services'
  ];

  const countries = [
    'all', 'Bangladesh', 'USA', 'China', 'South Korea', 'Japan', 
    'Germany', 'India', 'Singapore', 'Malaysia', 'Thailand'
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBrands(sampleBrands);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || brand.category === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || brand.country === selectedCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const featuredBrands = brands.filter(brand => brand.premium || brand.trending).slice(0, 6);
  const bangladeshBrands = brands.filter(brand => brand.bangladeshBased);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Brands
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Explore premium brands from Bangladesh and around the world. From local artisans to global giants.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Award className="h-4 w-4" />
              <span>1000+ Verified Brands</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Globe className="h-4 w-4" />
              <span>Global & Local Selection</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Crown className="h-4 w-4" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Brands</h2>
            <p className="text-gray-600">Premium and trending brands curated for you</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredBrands.map(brand => (
              <Link href={`/brands/${brand.id}`} key={brand.id}>
                <div className="bg-white rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 hover:shadow-lg group cursor-pointer">
                  <div className="aspect-square p-6 flex items-center justify-center bg-gray-50 rounded-t-lg group-hover:bg-purple-50 transition-colors">
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/120/80?text=${brand.name}`;
                      }}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">{brand.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{brand.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{brand.totalProducts} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bangladesh Brands Spotlight */}
      <section className="py-12 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🇧🇩 Pride of Bangladesh
            </h2>
            <p className="text-gray-600">Supporting local brands and artisans</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bangladeshBrands.map(brand => (
              <div key={brand.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/64/64?text=${brand.name}`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{brand.name}</h3>
                      <p className="text-sm text-gray-600">Since {brand.established}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{brand.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{brand.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {brand.totalProducts} products
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {brand.followers.toLocaleString()} followers
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    {brand.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link href={`/brands/${brand.id}`}>
                    <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Explore Brand
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Brands</h2>
            <p className="text-gray-600">Browse our complete collection of verified brands</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading brands...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center text-gray-600">
                Showing {filteredBrands.length} of {brands.length} brands
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBrands.map(brand => (
                    <div key={brand.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <img 
                            src={brand.logo} 
                            alt={brand.name}
                            className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/48/48?text=${brand.name}`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{brand.name}</h3>
                            <p className="text-sm text-gray-500">{brand.country}</p>
                          </div>
                          {brand.verified && (
                            <Award className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{brand.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{brand.rating}</span>
                          </div>
                          <span>{brand.totalProducts} products</span>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                          {brand.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {brand.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{brand.tags.length - 2}
                            </span>
                          )}
                        </div>
                        
                        <Link href={`/brands/${brand.id}`}>
                          <button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            View Brand
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBrands.map(brand => (
                    <div key={brand.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-6 flex items-center gap-6">
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/placeholder/64/64?text=${brand.name}`;
                          }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl text-gray-900">{brand.name}</h3>
                            {brand.verified && <Award className="h-5 w-5 text-blue-500" />}
                            {brand.trending && <TrendingUp className="h-5 w-5 text-green-500" />}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{brand.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{brand.rating} rating</span>
                            </div>
                            <span>{brand.totalProducts} products</span>
                            <span>{brand.followers.toLocaleString()} followers</span>
                            <span>Since {brand.established}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            {brand.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Link href={`/brands/${brand.id}`}>
                            <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-2 px-6 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              View Brand
                            </button>
                          </Link>
                          <button className="border border-gray-300 text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Follow
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandDirectory;