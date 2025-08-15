import React from 'react';
import { Header } from '@/components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import RecommendationFeed from '@/components/personalization/RecommendationFeed';

/**
 * Recommendations Page - Amazon.com/Shopee.sg-Level Product Discovery
 * Complete AI-powered recommendation feed with personalized product discovery
 */
const RecommendationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendationFeed />
      </main>
      <Footer />
    </div>
  );
};

export default RecommendationsPage;