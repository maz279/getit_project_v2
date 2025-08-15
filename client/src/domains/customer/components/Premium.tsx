
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const Premium: React.FC = () => {
  useSEO({
    title: 'Premium - GetIt Bangladesh | Exclusive Premium Products',
    description: 'Discover our premium collection of high-quality products and exclusive brands.',
    keywords: 'premium products, exclusive brands, luxury items, bangladesh premium shopping'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">⭐ Premium Collection ⭐</h1>
            <p className="text-lg text-gray-600">Exclusive premium products and brands</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">👑 Premium Experience 👑</h2>
            <p className="mb-6">Discover our curated collection of premium products from top brands.</p>
            <div className="text-6xl mb-4">💎</div>
            <p className="text-lg">Premium collection coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Premium;
