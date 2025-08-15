import React from 'react';

export const GetStartedSection: React.FC = () => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Get Started with GetIt</h2>
          <p className="text-gray-600">Join thousands of satisfied customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">1. Download App</h3>
            <p className="text-gray-600 mb-4">Get our mobile app for the best shopping experience</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Download Now
            </button>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">2. Browse & Shop</h3>
            <p className="text-gray-600 mb-4">Explore millions of products from verified sellers</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Start Shopping
            </button>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">3. Fast Delivery</h3>
            <p className="text-gray-600 mb-4">Get your orders delivered quickly and securely</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Track Order
            </button>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Ready to start shopping?</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition">
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  );
};