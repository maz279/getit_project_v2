import React from 'react';

export const LatestProducts: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Latest Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-36 flex items-center justify-center relative">
                <span className="text-gray-500">Product Image</span>
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  New
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1">Premium Bluetooth Speaker</h3>
                <p className="text-xs text-gray-600 mb-2">Crystal clear sound quality</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600">৳2,499</span>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};