import React from 'react';

export const RecentlyLaunched: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Recently Launched</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Smart Home Collection</h3>
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
              Just Launched
            </span>
          </div>
          <p className="mb-4">Transform your home with our latest smart devices and automation systems</p>
          <div className="flex items-center justify-between">
            <span className="text-lg">Starting from ৳5,999</span>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Explore
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Fitness & Wellness</h3>
            <span className="bg-white text-pink-600 px-3 py-1 rounded-full text-sm font-semibold">
              New Range
            </span>
          </div>
          <p className="mb-4">Premium fitness equipment and wellness products for a healthier lifestyle</p>
          <div className="flex items-center justify-between">
            <span className="text-lg">Starting from ৳2,499</span>
            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};