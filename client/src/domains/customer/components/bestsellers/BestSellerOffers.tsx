import React from 'react';

export const BestSellerOffers: React.FC = () => {
  return (
    <div className="bg-yellow-50 p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">🏆 Top Deals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Up to 70% Off</h3>
          <p className="text-sm text-gray-600">Electronics & Gadgets</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Buy 2 Get 1 Free</h3>
          <p className="text-sm text-gray-600">Fashion & Accessories</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Free Shipping</h3>
          <p className="text-sm text-gray-600">Orders over ৳1000</p>
        </div>
      </div>
    </div>
  );
};