
import React, { useState } from 'react';
import { BarChart3, TrendingDown, Package, Check, DollarSign } from 'lucide-react';

interface WishlistStatsProps {
  totalItems: number;
  totalValue: number;
  availableItems: number;
  priceDrops: number;
}

export const WishlistStats: React.FC<WishlistStatsProps> = ({
  totalItems,
  totalValue,
  availableItems,
  priceDrops
}) => {
  const [showUSD, setShowUSD] = useState(false);

  const formatBanglaNumber = (num: number) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => banglaDigits[parseInt(digit)] || digit).join('');
  };

  const convertToUSD = (bdtAmount: number) => {
    const exchangeRate = 110; // Approximate BDT to USD rate
    return Math.round(bdtAmount / exchangeRate);
  };

  const stats = [
    {
      title: 'Total Items',
      titleBn: 'মোট পণ্য',
      value: totalItems,
      valueBn: formatBanglaNumber(totalItems),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Value',
      titleBn: 'মোট মূল্য',
      value: showUSD ? `$${convertToUSD(totalValue)}` : `৳${totalValue.toLocaleString()}`,
      valueBn: showUSD ? `$${convertToUSD(totalValue)}` : `৳${formatBanglaNumber(totalValue)}`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hasToggle: true
    },
    {
      title: 'Available Items',
      titleBn: 'উপলব্ধ পণ্য',
      value: availableItems,
      valueBn: formatBanglaNumber(availableItems),
      icon: Check,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Price Drops',
      titleBn: 'দাম কমেছে',
      value: priceDrops,
      valueBn: formatBanglaNumber(priceDrops),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            {stat.hasToggle && (
              <button
                onClick={() => setShowUSD(!showUSD)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                {showUSD ? 'BDT' : 'USD'}
              </button>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
          <p className="text-xs text-gray-500">{stat.titleBn}: {stat.valueBn}</p>
        </div>
      ))}
    </div>
  );
};
