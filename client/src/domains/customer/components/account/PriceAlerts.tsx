import React from 'react';
import { Bell, TrendingDown, TrendingUp, AlertCircle, Check, Eye } from 'lucide-react';

export const PriceAlerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      productName: 'Samsung Galaxy A54 5G',
      currentPrice: 35999,
      targetPrice: 32000,
      originalPrice: 39999,
      priceChange: -4000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      productName: 'Nike Air Max 270',
      currentPrice: 8999,
      targetPrice: 8000,
      originalPrice: 12999,
      priceChange: -999,
      status: 'triggered',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      productName: 'Sony WH-1000XM5',
      currentPrice: 28999,
      targetPrice: 25000,
      originalPrice: 32999,
      priceChange: 1000,
      status: 'watching',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Price Alerts</h2>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Set New Alert
        </button>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <img
              src={alert.image}
              alt={alert.productName}
              className="w-16 h-16 object-cover rounded-md"
            />
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{alert.productName}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Current:</span>
                  <span className="font-bold text-gray-900">৳{alert.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-bold text-blue-600">৳{alert.targetPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {alert.priceChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${alert.priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {alert.priceChange > 0 ? '+' : ''}৳{alert.priceChange.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {alert.status === 'triggered' ? (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Check className="w-3 h-3" />
                  Triggered
                </div>
              ) : alert.status === 'active' ? (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Eye className="w-3 h-3" />
                  Watching
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
