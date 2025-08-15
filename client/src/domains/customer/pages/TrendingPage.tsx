import React, { useState } from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { TrendingProducts } from '../components/discovery/TrendingProducts';
import { TrendingCategories } from '../components/deals/TrendingCategories';
import { TrendingBrands } from '../components/deals/TrendingBrands';
import { TrendingHashtags } from '../components/deals/TrendingHashtags';
// import { SocialTrends } from '../../components/trending/SocialTrends';
import { Button } from '@/shared/ui/button';
import { TrendingUp, Flame, Hash, Users, Star, Filter, Grid, List } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

const TrendingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'social'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useSEO({
    title: 'Trending Products & Categories - GetIt Bangladesh | What\'s Hot',
    description: 'Discover trending products, categories, and brands on GetIt Bangladesh. See what\'s popular and viral in Bangladesh\'s online shopping community.',
    keywords: 'trending products, popular items, hot categories, viral products, bangladesh trends, what\'s hot',
    canonical: 'https://getit-bangladesh.com/trending',
  });

  const tabs = [
    { id: 'products', label: 'Products', icon: TrendingUp, color: 'text-red-600' },
    { id: 'categories', label: 'Categories', icon: Flame, color: 'text-orange-600' },
    { id: 'brands', label: 'Brands', icon: Star, color: 'text-yellow-600' },
    { id: 'social', label: 'Social', icon: Users, color: 'text-purple-600' },
  ];

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">🔥 Trending Now</h1>
            <p className="text-xl text-blue-100 mb-6">
              Discover what's hot and popular in Bangladesh
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <span className="text-sm">Live trending data</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm">Updated hourly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Controls */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${tab.color}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                {/* Time Range Selector */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id as any)}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        timeRange === range.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Hashtags */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <TrendingHashtags />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {activeTab === 'products' && (
            <div>
              <TrendingProducts />
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg">
                  Load More Trending Products
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <TrendingCategories timeRange={timeRange} viewMode={viewMode} />
          )}
          
          {activeTab === 'brands' && (
            <TrendingBrands timeRange={timeRange} viewMode={viewMode} />
          )}
          
          {activeTab === 'social' && (
            <SocialTrends timeRange={timeRange} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrendingPage;