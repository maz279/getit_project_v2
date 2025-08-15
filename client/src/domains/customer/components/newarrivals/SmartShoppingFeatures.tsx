import React from 'react';

export const SmartShoppingFeatures: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Smart Shopping Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-3">AI-Powered Search</h3>
          <p className="text-gray-600">Find exactly what you're looking for with our intelligent search technology</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
          <p className="text-gray-600">Get personalized product suggestions based on your preferences</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-3">One-Click Checkout</h3>
          <p className="text-gray-600">Complete your purchase in seconds with our streamlined checkout</p>
        </div>
      </div>
    </div>
  );
};