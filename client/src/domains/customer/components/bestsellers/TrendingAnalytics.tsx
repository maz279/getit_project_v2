import React from 'react';

export const TrendingAnalytics: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">📈 Trending Analytics</h2>
      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">250K+</div>
            <h3 className="font-semibold">Products Sold</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
            <h3 className="font-semibold">Customer Satisfaction</h3>
            <p className="text-sm text-gray-600">Based on reviews</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">15M+</div>
            <h3 className="font-semibold">Happy Customers</h3>
            <p className="text-sm text-gray-600">Since 2020</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Top Trending Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Electronics</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fashion</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm text-gray-600">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Home & Garden</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm text-gray-600">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};