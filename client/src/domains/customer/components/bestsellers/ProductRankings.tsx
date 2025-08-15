import React from 'react';

export const ProductRankings: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">📊 Product Rankings</h2>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow flex items-center">
          <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">1</div>
          <div>
            <h3 className="font-semibold">Wireless Earbuds Pro</h3>
            <p className="text-sm text-gray-600">₹2,999 • 4.8★ • 2,543 sold</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <div className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">2</div>
          <div>
            <h3 className="font-semibold">Smart Watch Series 5</h3>
            <p className="text-sm text-gray-600">₹8,999 • 4.7★ • 1,876 sold</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <div className="bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">3</div>
          <div>
            <h3 className="font-semibold">Bluetooth Speaker</h3>
            <p className="text-sm text-gray-600">₹1,499 • 4.6★ • 1,234 sold</p>
          </div>
        </div>
      </div>
    </div>
  );
};