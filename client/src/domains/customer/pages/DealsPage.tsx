import React, { useState } from 'react';
import Header from '../../../shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { FlashSaleSection } from '../home/homepage/FlashSaleSection';
import { DealCountdown } from '../components/deals/DealCountdown';
import { DealCategories } from '../components/deals/DealCategories';
import { TodaysDeals } from '../components/deals/TodaysDeals';
import { UpcomingDeals } from '../components/deals/UpcomingDeals';
import { Button } from '../../../shared/ui/button';
import { Filter, Grid, List, Clock, Star, Percent, TrendingUp } from 'lucide-react';
import { useSEO } from '../../../shared/hooks/useSEO';

const DealsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'flash' | 'mega'>('today');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useSEO({
    title: 'Daily Deals & Flash Sales - GetIt Bangladesh | Best Offers',
    description: 'Find the best daily deals, flash sales, and mega discounts on GetIt Bangladesh. Limited time offers from verified vendors with fast delivery.',
    keywords: 'daily deals, flash sales, discounts, offers, mega sale, limited time, best prices, bangladesh deals',
    canonical: 'https://getit-bangladesh.com/deals',
  });

  const tabs = [
    { id: 'today', label: 'Today\'s Deals', icon: Clock, color: 'text-blue-600' },
    { id: 'upcoming', label: 'Upcoming', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'flash', label: 'Flash Sales', icon: Star, color: 'text-red-600' },
    { id: 'mega', label: 'Mega Deals', icon: Percent, color: 'text-green-600' },
  ];

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">🔥 Daily Deals & Flash Sales</h1>
            <p className="text-xl text-blue-100 mb-6">
              Limited time offers with up to 80% discount
            </p>
            <DealCountdown />
          </div>
        </div>

        {/* Navigation Tabs */}
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

        {/* Deal Categories */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <DealCategories />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {activeTab === 'today' && <TodaysDeals viewMode={viewMode} />}
          {activeTab === 'upcoming' && <UpcomingDeals viewMode={viewMode} />}
          {activeTab === 'flash' && <FlashSaleSection />}
          {activeTab === 'mega' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎯 Mega Deals Coming Soon
              </h2>
              <p className="text-gray-600 mb-8">
                Get ready for our biggest sale of the year with discounts up to 90%
              </p>
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                Notify Me
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DealsPage;