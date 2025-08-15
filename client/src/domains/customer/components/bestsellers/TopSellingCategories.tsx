import React from 'react';

export const TopSellingCategories: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">🔥 Top Selling Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold">Electronics</h3>
          <p className="text-sm text-gray-600">12,543 sold</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">👕</div>
          <h3 className="font-semibold">Fashion</h3>
          <p className="text-sm text-gray-600">8,765 sold</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">🏠</div>
          <h3 className="font-semibold">Home & Garden</h3>
          <p className="text-sm text-gray-600">5,432 sold</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-semibold">Books</h3>
          <p className="text-sm text-gray-600">3,210 sold</p>
        </div>
      </div>
    </div>
  );
};