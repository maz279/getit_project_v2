import React from 'react';

export const TodaysArrivals: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Today's Fresh Arrivals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">Product Image</span>
            </div>
            <div className="p-4">
              <div className="text-xs text-blue-600 font-semibold mb-1">NEW TODAY</div>
              <h3 className="font-semibold mb-2">Premium Wireless Headphones</h3>
              <p className="text-sm text-gray-600 mb-3">High-quality audio experience with noise cancellation</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">৳4,999</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};