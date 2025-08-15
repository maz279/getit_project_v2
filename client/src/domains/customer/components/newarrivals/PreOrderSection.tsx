import React from 'react';

export const PreOrderSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Pre-Order Now</h2>
          <p className="text-lg opacity-90">Be the first to get the latest products</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">iPhone 15 Pro Max</h3>
            <p className="text-sm opacity-90 mb-4">Next-generation smartphone with advanced AI features</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">৳129,999</span>
              <span className="text-sm bg-green-500 px-2 py-1 rounded">Available Soon</span>
            </div>
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Pre-Order Now
            </button>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Samsung Galaxy S24</h3>
            <p className="text-sm opacity-90 mb-4">Revolutionary camera system with 200MP main sensor</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">৳119,999</span>
              <span className="text-sm bg-yellow-500 px-2 py-1 rounded">Pre-Order</span>
            </div>
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Reserve Now
            </button>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">PlayStation 5 Pro</h3>
            <p className="text-sm opacity-90 mb-4">Ultimate gaming console with 8K support</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">৳79,999</span>
              <span className="text-sm bg-blue-500 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Get Notified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};