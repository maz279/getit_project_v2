
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const WomensClothing: React.FC = () => {
  useSEO({
    title: 'Women\'s Clothing - GetIt Bangladesh | Fashion for Women',
    description: 'Discover the latest women\'s fashion trends, traditional sarees, modern dresses, and stylish accessories.',
    keywords: 'women fashion, sarees, dresses, clothing, bangladesh fashion, traditional wear'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-pink-600 mb-4">👗 Women's Fashion 👗</h1>
            <p className="text-lg text-gray-600">Discover the latest trends in women's clothing</p>
          </div>
          
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">✨ Fashion Collection ✨</h2>
            <p className="mb-6">Explore our extensive collection of women's clothing from traditional to modern styles.</p>
            <div className="text-6xl mb-4">👚</div>
            <p className="text-lg">Complete fashion catalog coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WomensClothing;
