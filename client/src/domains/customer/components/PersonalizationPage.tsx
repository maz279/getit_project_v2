import React from 'react';
import { Header } from '@/components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import PersonalizationEngine from '@/components/personalization/PersonalizationEngine';

/**
 * Personalization Page - Amazon.com/Shopee.sg-Level AI Personalization
 * Complete AI-powered personalization settings and preferences management
 */
const PersonalizationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizationEngine />
      </main>
      <Footer />
    </div>
  );
};

export default PersonalizationPage;