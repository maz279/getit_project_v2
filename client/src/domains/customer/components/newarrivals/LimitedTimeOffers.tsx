import React from 'react';

export const LimitedTimeOffers: React.FC = () => {
  return (
    <div className="bg-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-2">Limited Time Offers</h2>
          <p className="text-gray-600">Don't miss out on these amazing deals!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Flash Sale</h3>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">50% OFF</span>
            </div>
            <p className="text-gray-600 mb-4">Electronics and gadgets at unbeatable prices</p>
            <div className="text-sm text-red-600 font-semibold mb-2">Ends in: 2:45:30</div>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
              Shop Now
            </button>
          </div>
          <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Weekend Deal</h3>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Buy 2 Get 1</span>
            </div>
            <p className="text-gray-600 mb-4">Fashion items with amazing offers</p>
            <div className="text-sm text-blue-600 font-semibold mb-2">Valid until Sunday</div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};