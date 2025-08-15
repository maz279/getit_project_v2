
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const GroupBuy: React.FC = () => {
  useSEO({
    title: 'Group Buy - GetIt Bangladesh | Buy Together, Save More',
    description: 'Join group buying to get better prices! Team up with other buyers for bulk discounts.',
    keywords: 'group buy, bulk buying, team buying, group discounts, bangladesh group buy'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-teal-600 mb-4">👥 Group Buy 👥</h1>
            <p className="text-lg text-gray-600">Buy together, save more!</p>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🤝 Team Up for Better Prices 🤝</h2>
            <p className="mb-6">Join group buying campaigns to unlock bulk discounts and special pricing.</p>
            <div className="text-6xl mb-4">💪</div>
            <p className="text-lg">Group buying platform launching soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupBuy;
