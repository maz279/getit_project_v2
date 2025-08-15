import React, { useState } from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { RecommendedSection } from '../home/homepage/RecommendedSection';
// import { PersonalizedRecommendations } from '../../components/recommendations/PersonalizedRecommendations';
import { AIRecommendations } from '../home/homepage/header/AIRecommendations';
// import { CollaborativeFiltering } from '../../components/recommendations/CollaborativeFiltering';
// import { RecommendationSettings } from '../../components/recommendations/RecommendationSettings';
import { Button } from '@/shared/ui/button';
import { Brain, Users, Star, Settings, Filter, Grid, List } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

const RecommendationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'ai' | 'collaborative' | 'settings'>('personal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useSEO({
    title: 'Personalized Recommendations - GetIt Bangladesh | Just For You',
    description: 'Discover products tailored to your interests with AI-powered recommendations on GetIt Bangladesh. Find items you\'ll love based on your shopping history.',
    keywords: 'personalized recommendations, ai recommendations, product suggestions, custom shopping, based on history',
    canonical: 'https://getit-bangladesh.com/recommendations',
  });

  const tabs = [
    { id: 'personal', label: 'For You', icon: Star, color: 'text-yellow-600' },
    { id: 'ai', label: 'AI Picks', icon: Brain, color: 'text-purple-600' },
    { id: 'collaborative', label: 'Similar Users', icon: Users, color: 'text-blue-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">🎯 Just For You</h1>
            <p className="text-xl text-blue-100 mb-6">
              Discover products tailored to your interests and shopping history
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-sm">AI-powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">95% accuracy</span>
              </div>
            </div>
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

              {activeTab !== 'settings' && (
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
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'personal' && (
            <div>
              <PersonalizedRecommendations viewMode={viewMode} />
              <div className="mt-8">
                <RecommendedSection />
              </div>
            </div>
          )}
          
          {activeTab === 'ai' && (
            <AIRecommendations viewMode={viewMode} />
          )}
          
          {activeTab === 'collaborative' && (
            <CollaborativeFiltering viewMode={viewMode} />
          )}
          
          {activeTab === 'settings' && (
            <RecommendationSettings />
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How are our recommendations?
            </h2>
            <p className="text-gray-600 mb-8">
              Your feedback helps us improve our suggestions for you
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg">
                👍 Great suggestions
              </Button>
              <Button variant="outline" size="lg">
                👎 Not relevant
              </Button>
              <Button variant="outline" size="lg">
                💡 Suggestions
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecommendationsPage;