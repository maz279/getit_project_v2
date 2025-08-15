import React from 'react';

export const SpecialFeatures: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Special Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold mb-2">Free Shipping</h3>
            <p className="text-sm opacity-90">On orders over ৳1000</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Secure Payment</h3>
            <p className="text-sm opacity-90">100% secure transactions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">↩️</div>
            <h3 className="font-semibold mb-2">Easy Returns</h3>
            <p className="text-sm opacity-90">30-day return policy</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-sm opacity-90">Verified products only</p>
          </div>
        </div>
      </div>
    </div>
  );
};