import React from 'react';

export const VendorSpotlight: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">🏪 Vendor Spotlight</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">TT</div>
            <div className="ml-3">
              <h3 className="font-semibold">TechTrend Store</h3>
              <p className="text-sm text-gray-600">Electronics Specialist</p>
            </div>
          </div>
          <p className="text-gray-700 mb-3">Top-rated seller with 99.5% positive feedback. Specializing in latest electronics and gadgets.</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">✅ Verified Seller</span>
            <span className="text-sm text-gray-600">4.9★ (2,543 reviews)</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">FB</div>
            <div className="ml-3">
              <h3 className="font-semibold">Fashion Boutique</h3>
              <p className="text-sm text-gray-600">Fashion & Lifestyle</p>
            </div>
          </div>
          <p className="text-gray-700 mb-3">Trendy fashion items and accessories with fast delivery and excellent customer service.</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">✅ Verified Seller</span>
            <span className="text-sm text-gray-600">4.8★ (1,876 reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
};