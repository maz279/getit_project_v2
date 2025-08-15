
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const FlashSale: React.FC = () => {
  useSEO({
    title: 'Flash Sale - GetIt Bangladesh | Limited Time Offers',
    description: 'Don\'t miss out on incredible flash sale deals! Limited time offers on electronics, fashion, home goods and more.',
    keywords: 'flash sale, deals, discounts, limited time offers, bangladesh shopping'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-4">⚡ Flash Sale ⚡</h1>
            <p className="text-lg text-gray-600">Limited time offers - Don't miss out!</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🔥 Lightning Deals 🔥</h2>
            <p className="mb-6">Flash sale products will be displayed here with countdown timers and special discounts.</p>
            <div className="text-6xl mb-4">⏰</div>
            <p className="text-lg">Coming Soon - Amazing deals await!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FlashSale;
