import React from 'react';

export const SeasonalCollections: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Seasonal Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-b from-orange-400 to-red-500 text-white rounded-lg p-6 h-48 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🍂 Autumn Collection</h3>
            <p className="text-sm opacity-90">Cozy sweaters and warm accessories</p>
          </div>
          <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
        <div className="bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-lg p-6 h-48 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">❄️ Winter Essentials</h3>
            <p className="text-sm opacity-90">Warm clothing and heating appliances</p>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Explore
          </button>
        </div>
        <div className="bg-gradient-to-b from-green-400 to-green-600 text-white rounded-lg p-6 h-48 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🌸 Spring Fresh</h3>
            <p className="text-sm opacity-90">Fresh styles and garden essentials</p>
          </div>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Discover
          </button>
        </div>
        <div className="bg-gradient-to-b from-yellow-400 to-orange-500 text-white rounded-lg p-6 h-48 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">☀️ Summer Vibes</h3>
            <p className="text-sm opacity-90">Light clothing and outdoor gear</p>
          </div>
          <button className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};