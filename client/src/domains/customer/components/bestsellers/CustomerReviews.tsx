import React from 'react';

export const CustomerReviews: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">💬 Customer Reviews</h2>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
            <div className="ml-3">
              <p className="font-semibold">Ahmed Rahman</p>
              <div className="text-yellow-500 text-sm">★★★★★</div>
            </div>
          </div>
          <p className="text-gray-700">"Excellent product quality and fast delivery! Highly recommended."</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
            <div className="ml-3">
              <p className="font-semibold">Sarah Khan</p>
              <div className="text-yellow-500 text-sm">★★★★☆</div>
            </div>
          </div>
          <p className="text-gray-700">"Great value for money. The product exceeded my expectations."</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">R</div>
            <div className="ml-3">
              <p className="font-semibold">Rashid Ahmed</p>
              <div className="text-yellow-500 text-sm">★★★★★</div>
            </div>
          </div>
          <p className="text-gray-700">"Outstanding customer service and product quality. Will buy again!"</p>
        </div>
      </div>
    </div>
  );
};