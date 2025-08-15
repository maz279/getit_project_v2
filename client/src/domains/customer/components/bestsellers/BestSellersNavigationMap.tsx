import React from 'react';

export const BestSellersNavigationMap: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Best Sellers Navigation</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded shadow">
          <span className="text-sm font-medium">Electronics</span>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <span className="text-sm font-medium">Fashion</span>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <span className="text-sm font-medium">Home & Garden</span>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <span className="text-sm font-medium">Sports</span>
        </div>
      </div>
    </div>
  );
};