
import React from 'react';

export const CustomerProtectionSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🛡️ Customer Protection Guarantee</h2>
          <p className="text-xl text-gray-600">Shop with confidence - your satisfaction is guaranteed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-bold mb-3">Authenticity Assured</h3>
            <p className="text-gray-600 text-sm">100% genuine products with warranty protection and easy returns within 7 days of delivery.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-lg font-bold mb-3">Secure Transactions</h3>
            <p className="text-gray-600 text-sm">Bank-level security with encrypted payment processing and fraud protection monitoring.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-lg font-bold mb-3">Reliable Support</h3>
            <p className="text-gray-600 text-sm">24/7 customer service in Bangla and English via phone, WhatsApp, live chat, and email support.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-bold mb-3">Delivery Guarantee</h3>
            <p className="text-gray-600 text-sm">Timely delivery commitment with full refund if orders don't arrive within promised timeframes.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
