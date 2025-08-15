
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const TrackOrder: React.FC = () => {
  useSEO({
    title: 'Track Order - GetIt Bangladesh | Order Tracking',
    description: 'Track your order status and delivery progress in real-time.',
    keywords: 'track order, order status, delivery tracking, bangladesh order tracking'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-600 mb-4">📦 Track Your Order 📦</h1>
            <p className="text-lg text-gray-600">Enter your order details to track delivery status</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🚚 Order Tracking System 🚚</h2>
            <p className="mb-6">Real-time order tracking with detailed delivery updates.</p>
            <div className="text-6xl mb-4">📍</div>
            <p className="text-lg">Order tracking system launching soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
