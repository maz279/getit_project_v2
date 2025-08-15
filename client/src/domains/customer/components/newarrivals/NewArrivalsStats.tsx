import React from 'react';

export const NewArrivalsStats: React.FC = () => {
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">250+</div>
            <div className="text-gray-600">New Products</div>
            <div className="text-sm text-gray-500">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">15</div>
            <div className="text-gray-600">Categories</div>
            <div className="text-sm text-gray-500">Updated Daily</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Brands</div>
            <div className="text-sm text-gray-500">New Arrivals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24h</div>
            <div className="text-gray-600">Fresh Stock</div>
            <div className="text-sm text-gray-500">Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
};