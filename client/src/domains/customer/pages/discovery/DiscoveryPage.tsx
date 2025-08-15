import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
// import { AIPersonalizationEngine } from '../../../components/customer/discovery/AIPersonalizationEngine';
import { AdvancedTrendingCarousel } from '../../components/discovery/AdvancedTrendingCarousel';
// import { EnhancedCategoryBrowser } from '../../../components/customer/discovery/EnhancedCategoryBrowser';
// import { EnhancedVoiceSearch } from '../../../components/customer/discovery/EnhancedVoiceSearch';
// import { EnhancedVisualSearch } from '../../../components/customer/discovery/EnhancedVisualSearch';
// import { LiveShoppingStreams } from '../../../components/customer/discovery/LiveShoppingStreams';
// import { SocialCommerceIntegration } from '../../../components/customer/discovery/SocialCommerceIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useSEO } from '@/shared/hooks/useSEO';
import { Search, Sparkles, TrendingUp, Eye, Users, ShoppingBag } from 'lucide-react';

const DiscoveryPage: React.FC = () => {
  // SEO optimization for discovery page
  useSEO({
    title: 'Product Discovery - AI-Powered Shopping Experience | GetIt Bangladesh',
    description: 'Discover products through AI personalization, voice search, visual search, live shopping streams, and social commerce. Advanced product discovery features for Bangladesh market.',
    keywords: 'product discovery, AI search, voice search, visual search, live shopping, social commerce, personalized shopping, bangladesh ecommerce, trending products',
    canonical: 'https://getit-bangladesh.com/discover',
    ogType: 'website',
    ogImage: 'https://getit-bangladesh.com/images/discovery-banner.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Product Discovery - GetIt Bangladesh",
      "url": "https://getit-bangladesh.com/discover",
      "description": "AI-powered product discovery platform with voice search, visual search, live shopping streams, and social commerce features.",
      "publisher": {
        "@type": "Organization",
        "name": "GetIt Bangladesh"
      }
    }
  });

  const handleSearchResult = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleImageSearch = (imageData: string) => {
    window.location.href = `/search?visual=true`;
  };

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Badge className="bg-white text-purple-600 px-4 py-2 text-lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Amazon.com/Shopee.sg-Level Discovery
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold">
                স্মার্ট প্রোডাক্ট ডিসকভারি
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                AI-powered personalization, voice search, visual search, live shopping, and social commerce - all in one place
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4" />
                  Advanced Search
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <TrendingUp className="h-4 w-4" />
                  Real-time Trends
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <Eye className="h-4 w-4" />
                  Visual Search
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <Users className="h-4 w-4" />
                  Social Commerce
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Features Overview */}
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Products Like Never Before
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Experience the future of shopping with our AI-powered discovery features designed specifically for Bangladesh market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI Personalization */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    AI Personalization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get personalized product recommendations based on your shopping behavior, preferences, and cultural context.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('ai-personalization')?.scrollIntoView()}>
                    Explore AI Features
                  </Button>
                </CardContent>
              </Card>

              {/* Voice & Visual Search */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Search className="h-5 w-5 text-purple-600" />
                    </div>
                    Smart Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Search using your voice in Bengali or English, or upload images to find similar products instantly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('smart-search')?.scrollIntoView()}>
                    Try Smart Search
                  </Button>
                </CardContent>
              </Card>

              {/* Social Commerce */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Users className="h-5 w-5 text-pink-600" />
                    </div>
                    Social Shopping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Discover trending products through social media, influencer recommendations, and live shopping streams.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('social-commerce')?.scrollIntoView()}>
                    Join Social Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Personalization Section */}
        <section id="ai-personalization" className="py-16">
          <AIPersonalizationEngine className="container mx-auto px-4 md:px-6 lg:px-8" />
        </section>

        {/* Trending Products Section */}
        <section className="py-16 bg-gray-50">
          <AdvancedTrendingCarousel className="container mx-auto px-4 md:px-6 lg:px-8" />
        </section>

        {/* Category Browser Section */}
        <section className="py-16">
          <EnhancedCategoryBrowser className="container mx-auto px-4 md:px-6 lg:px-8" />
        </section>

        {/* Smart Search Section */}
        <section id="smart-search" className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Smart Search Experience
              </h2>
              <p className="text-gray-600 text-lg">
                Search using your voice or images - powered by advanced AI
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EnhancedVoiceSearch onSearchResult={handleSearchResult} />
              <EnhancedVisualSearch onImageSearch={handleImageSearch} />
            </div>
          </div>
        </section>

        {/* Live Shopping Section */}
        <section className="py-16">
          <LiveShoppingStreams className="container mx-auto px-4 md:px-6 lg:px-8" maxStreams={8} />
        </section>

        {/* Social Commerce Section */}
        <section id="social-commerce" className="py-16 bg-gray-50">
          <SocialCommerceIntegration className="container mx-auto px-4 md:px-6 lg:px-8" />
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Discover Amazing Products?
              </h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Start your personalized shopping journey with AI-powered discovery features
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Start Shopping Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Explore Categories
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiscoveryPage;