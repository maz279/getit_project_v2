
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const Cart: React.FC = () => {
  useSEO({
    title: 'Shopping Cart - GetIt Bangladesh | Your Cart',
    description: 'Review items in your shopping cart and proceed to checkout on GetIt Bangladesh.',
    keywords: 'shopping cart, checkout, bangladesh cart'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-4">🛒 Shopping Cart 🛒</h1>
            <p className="text-lg text-gray-600">Review your items and checkout</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🛍️ Your Cart 🛍️</h2>
            <p className="mb-6">Review items, apply coupons, and proceed to secure checkout.</p>
            <div className="text-6xl mb-4">💳</div>
            <p className="text-lg">Shopping cart functionality coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
