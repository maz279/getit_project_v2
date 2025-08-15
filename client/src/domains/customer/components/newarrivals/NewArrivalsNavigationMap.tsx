import React from 'react';

export const NewArrivalsNavigationMap: React.FC = () => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-center space-x-6">
          <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold">
            All Categories
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
            Electronics
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
            Fashion
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
            Home & Garden
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
            Sports & Outdoors
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
            Beauty & Health
          </button>
        </div>
      </div>
    </div>
  );
};