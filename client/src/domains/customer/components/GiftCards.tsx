
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const GiftCards: React.FC = () => {
  useSEO({
    title: 'Gift Cards - GetIt Bangladesh | Perfect Gift Solution',
    description: 'Give the perfect gift with GetIt gift cards. Available in multiple denominations for any occasion.',
    keywords: 'gift cards, digital gifts, bangladesh gift cards, online gifting'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-4">🎁 Gift Cards 🎁</h1>
            <p className="text-lg text-gray-600">The perfect gift for any occasion</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">💳 Digital Gift Cards 💳</h2>
            <p className="mb-6">Purchase and send gift cards instantly. Perfect for birthdays, holidays, and special occasions.</p>
            <div className="text-6xl mb-4">💝</div>
            <p className="text-lg">Gift card system launching soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GiftCards;
