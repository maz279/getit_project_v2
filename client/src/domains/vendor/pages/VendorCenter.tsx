
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const VendorCenter: React.FC = () => {
  useSEO({
    title: 'Vendor Center - GetIt Bangladesh | Sell Your Products Online',
    description: 'Join GetIt Bangladesh as a vendor. Start selling your products online with our comprehensive vendor platform.',
    keywords: 'vendor center, sell online, vendor registration, seller dashboard, bangladesh vendors'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">🏪 Vendor Center 🏪</h1>
            <p className="text-lg text-gray-600">Start selling your products online with GetIt Bangladesh</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">💼 Become a Vendor 💼</h2>
            <p className="mb-6">Join thousands of successful vendors selling on Bangladesh's leading marketplace.</p>
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg">Vendor registration and dashboard coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorCenter;
