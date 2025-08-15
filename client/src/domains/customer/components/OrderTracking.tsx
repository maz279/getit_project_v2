
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const OrderTracking: React.FC = () => {
  useSEO({
    title: 'Order Tracking - GetIt Bangladesh | Track Your Orders',
    description: 'Track your order status and delivery progress in real-time on GetIt Bangladesh.',
    keywords: 'order tracking, delivery status, bangladesh order tracking'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">📦 Order Tracking 📦</h1>
            <p className="text-lg text-gray-600">Track your order status and delivery progress</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🚚 Real-time Tracking 🚚</h2>
            <p className="mb-6">Track your orders in real-time from confirmation to delivery.</p>
            <div className="text-6xl mb-4">📍</div>
            <p className="text-lg">Advanced tracking system coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;
