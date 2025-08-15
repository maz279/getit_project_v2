
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const MegaSale: React.FC = () => {
  useSEO({
    title: 'Mega Sale - GetIt Bangladesh | Biggest Discounts of the Year',
    description: 'Join the biggest sale event of the year! Massive discounts across all categories.',
    keywords: 'mega sale, biggest discounts, annual sale, bangladesh mega sale'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">🛍️ Mega Sale 🛍️</h1>
            <p className="text-lg text-gray-600">The biggest sale event of the year!</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Mega Discounts 🎉</h2>
            <p className="mb-6">Massive discounts across all categories during our mega sale events.</p>
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-lg">Next mega sale coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MegaSale;
