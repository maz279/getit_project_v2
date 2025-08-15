import React from 'react';

export const CustomerFavorites: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Customer Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gray-200 h-40 flex items-center justify-center relative">
              <span className="text-gray-500">Product Image</span>
              <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                ❤️ Favorite
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Wireless Gaming Mouse</h3>
              <p className="text-sm text-gray-600 mb-3">Professional gaming with RGB lighting</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-blue-600">৳3,499</span>
                <div className="flex items-center">
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                  <span className="text-gray-500 text-sm ml-1">(456)</span>
                </div>
              </div>
              <div className="text-xs text-green-600 font-semibold">95% customers recommend</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};