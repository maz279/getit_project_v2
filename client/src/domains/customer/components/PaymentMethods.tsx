
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const PaymentMethods: React.FC = () => {
  useSEO({
    title: 'Payment Methods - GetIt Bangladesh | Secure Payment Options',
    description: 'Learn about our secure payment options including bKash, Nagad, Rocket, and international cards.',
    keywords: 'payment methods, bkash, nagad, rocket, secure payments, bangladesh payments'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">💳 Payment Methods 💳</h1>
            <p className="text-lg text-gray-600">Secure and convenient payment options</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🔒 Secure Payment Options 🔒</h2>
            <p className="mb-6">Multiple payment methods including mobile banking, cards, and cash on delivery.</p>
            <div className="text-6xl mb-4">💰</div>
            <p className="text-lg">Complete payment integration coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentMethods;
