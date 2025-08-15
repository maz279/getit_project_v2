import React from 'react';

export const TrustBadges: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">🛡️ Trust & Safety</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-semibold text-sm">Secure Payments</h3>
          <p className="text-xs text-gray-600">SSL Protected</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">🚚</div>
          <h3 className="font-semibold text-sm">Fast Delivery</h3>
          <p className="text-xs text-gray-600">2-Day Shipping</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">↩️</div>
          <h3 className="font-semibold text-sm">Easy Returns</h3>
          <p className="text-xs text-gray-600">30-Day Policy</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-semibold text-sm">Quality Assured</h3>
          <p className="text-xs text-gray-600">100% Authentic</p>
        </div>
      </div>
    </div>
  );
};