// BrandProfile.tsx - Amazon.com/Shopee.sg-Level Individual Brand Page
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Star, Award, MapPin, Calendar, Users, Package, Heart, Share2, Filter, Grid, List, ShoppingCart, Eye, TrendingUp, Globe, Phone, Mail, Clock, Shield, Truck, RefreshCw } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  bestseller: boolean;
}

interface BrandInfo {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  longDescription: string;
  category: string;
  country: string;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  followers: number;
  tags: string[];
  established: string;
  verified: boolean;
  trending: boolean;
  premium: boolean;
  bangladeshBased: boolean;
  contact: {
    website: string;
    email: string;
    phone: string;
    address: string;
  };
  policies: {
    returnPolicy: string;
    shippingPolicy: string;
    warrantyPolicy: string;
  };
  certifications: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

const BrandProfile: React.FC = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFollowing, setIsFollowing] = useState(false);

  useSEO({
    title: brand ? `${brand.name} - Premium Brand Store | GetIt Bangladesh` : 'Brand Profile | GetIt Bangladesh',
    description: brand ? `Shop ${brand.name} products. ${brand.description}. ${brand.totalProducts} products available with authentic guarantee.` : 'Premium brand store with authentic products and warranty.',
    keywords: brand ? `${brand.name}, ${brand.category}, premium products, authentic ${brand.name}, brand store` : 'brand store, premium products, authentic brands'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockBrand: BrandInfo = {
        id: brandId || '1',
        name: 'Samsung',
        logo: '/brands/samsung.png',
        banner: '/brands/samsung-banner.jpg',
        description: 'World leader in electronics and technology innovation',
        longDescription: 'Samsung is a South Korean multinational electronics company headquartered in Yeongtong-gu, Suwon. It is the pinnacle of technology and innovation in consumer electronics, semiconductors, and mobile communications. With a legacy spanning over 80 years, Samsung continues to shape the future of technology with cutting-edge products and services.',
        category: 'Electronics',
        country: 'South Korea',
        rating: 4.8,
        totalReviews: 125847,
        totalProducts: 2500,
        followers: 125000,
        tags: ['Premium', 'Technology', 'Innovation', 'Smartphones', 'Appliances'],
        established: '1938',
        verified: true,
        trending: true,
        premium: true,
        bangladeshBased: false,
        contact: {
          website: 'https://samsung.com',
          email: 'support@samsung.com.bd',
          phone: '+880-2-9881188',
          address: 'House # 128, Road # 13/A, Dhanmondi R/A, Dhaka-1209, Bangladesh'
        },
        policies: {
          returnPolicy: '30-day return policy for unopened items',
          shippingPolicy: 'Free shipping on orders over ৳5,000',
          warrantyPolicy: '1-3 years manufacturer warranty'
        },
        certifications: ['ISO 9001', 'CE Certified', 'FCC Approved', 'Energy Star'],
        socialMedia: {
          facebook: 'https://facebook.com/samsungbangladesh',
          instagram: 'https://instagram.com/samsungbangladesh',
          twitter: 'https://twitter.com/samsungbd'
        }
      };

      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Samsung Galaxy S24 Ultra',
          image: '/products/galaxy-s24-ultra.jpg',
          price: 125000,
          originalPrice: 140000,
          rating: 4.9,
          reviews: 1250,
          discount: 11,
          inStock: true,
          bestseller: true
        },
        {
          id: '2',
          name: 'Samsung 55" QLED 4K Smart TV',
          image: '/products/samsung-qled-tv.jpg',
          price: 85000,
          originalPrice: 95000,
          rating: 4.7,
          reviews: 890,
          discount: 11,
          inStock: true,
          bestseller: false
        },
        {
          id: '3',
          name: 'Samsung Galaxy Watch 6',
          image: '/products/galaxy-watch-6.jpg',
          price: 28000,
          originalPrice: 32000,
          rating: 4.6,
          reviews: 540,
          discount: 13,
          inStock: true,
          bestseller: false
        },
        {
          id: '4',
          name: 'Samsung Galaxy Buds Pro 2',
          image: '/products/galaxy-buds-pro.jpg',
          price: 15000,
          originalPrice: 18000,
          rating: 4.5,
          reviews: 320,
          discount: 17,
          inStock: false,
          bestseller: false
        }
      ];

      setBrand(mockBrand);
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, [brandId]);

  const productCategories = ['all', 'Smartphones', 'TVs', 'Appliances', 'Wearables', 'Audio'];
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    // In real app, products would have category field
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading brand profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
            <p className="text-gray-600 mb-6">The brand you're looking for doesn't exist.</p>
            <Link href="/brands">
              <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
                Browse All Brands
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Brand Banner */}
      <section className="relative">
        <div 
          className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${brand.banner})` }}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <div className="flex items-end gap-6 text-white">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `/api/placeholder/96/96?text=${brand.name}`;
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold">{brand.name}</h1>
                  {brand.verified && <Award className="h-8 w-8 text-blue-400" />}
                  {brand.trending && <TrendingUp className="h-8 w-8 text-green-400" />}
                </div>
                <p className="text-xl mb-4 max-w-2xl">{brand.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{brand.rating}</span>
                    <span>({brand.totalReviews.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{brand.totalProducts} products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{brand.followers.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{brand.country}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
              isFollowing 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFollowing ? 'fill-white' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </section>

      {/* Brand Info Tabs */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <a href="#products" className="py-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium whitespace-nowrap">
              Products
            </a>
            <a href="#about" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
              About
            </a>
            <a href="#reviews" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
              Reviews
            </a>
            <a href="#policies" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
              Policies
            </a>
            <a href="#contact" className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
              Contact
            </a>
          </nav>
        </div>
      </section>

      {/* Brand Stats */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{brand.rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{brand.totalProducts}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{(brand.followers / 1000).toFixed(0)}K+</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{new Date().getFullYear() - parseInt(brand.established)}</div>
              <div className="text-sm text-gray-600">Years of Trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Products</h2>
            
            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {productCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/300/200?text=${product.name}`;
                      }}
                    />
                    {product.bestseller && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                        Bestseller
                      </span>
                    )}
                    {product.discount && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-purple-600">৳{product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          product.inStock 
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white hover:shadow-lg' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      <Link href={`/products/${product.id}`}>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6 flex items-center gap-6">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-32 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/128/96?text=${product.name}`;
                      }}
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{product.name}</h3>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-gray-500">({product.reviews} reviews)</span>
                        </div>
                        {product.bestseller && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
                            Bestseller
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-purple-600">৳{product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-lg text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                        )}
                        {product.discount && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-sm rounded-full">
                            -{product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        className={`py-2 px-6 rounded-lg transition-all flex items-center gap-2 ${
                          product.inStock 
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white hover:shadow-lg' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      <Link href={`/products/${product.id}`}>
                        <button className="py-2 px-6 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About {brand.name}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{brand.longDescription}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {brand.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Company Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Established: {brand.established}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Origin: {brand.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>Category: {brand.category}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                  <div className="space-y-2">
                    {brand.certifications.map(cert => (
                      <div key={cert} className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Facts</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Products:</span>
                    <span className="font-medium">{brand.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers:</span>
                    <span className="font-medium">{brand.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating:</span>
                    <span className="font-medium">{brand.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews:</span>
                    <span className="font-medium">{brand.totalReviews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">&lt; 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section id="policies" className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Policies & Guarantees</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold text-gray-900">Return Policy</h3>
              </div>
              <p className="text-gray-600">{brand.policies.returnPolicy}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Shipping Policy</h3>
              </div>
              <p className="text-gray-600">{brand.policies.shippingPolicy}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Warranty Policy</h3>
              </div>
              <p className="text-gray-600">{brand.policies.warrantyPolicy}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{brand.contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{brand.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{brand.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a href={brand.contact.website} className="font-medium text-purple-600 hover:text-purple-700" target="_blank" rel="noopener noreferrer">
                      {brand.contact.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {brand.socialMedia.facebook && (
                  <a href={brand.socialMedia.facebook} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {brand.socialMedia.instagram && (
                  <a href={brand.socialMedia.instagram} className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {brand.socialMedia.twitter && (
                  <a href={brand.socialMedia.twitter} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandProfile;