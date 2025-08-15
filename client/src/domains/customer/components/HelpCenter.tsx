
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const HelpCenter: React.FC = () => {
  useSEO({
    title: 'Help Center - GetIt Bangladesh | Customer Support',
    description: 'Get help and support for your GetIt Bangladesh experience. Find answers to common questions and contact our support team.',
    keywords: 'help center, customer support, faq, bangladesh support'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-600 mb-4">🆘 Help Center 🆘</h1>
            <p className="text-lg text-gray-600">Get help and support for all your questions</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">📞 Customer Support 📞</h2>
            <p className="mb-6">24/7 customer support to help you with any questions or issues.</p>
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">Comprehensive help center coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
