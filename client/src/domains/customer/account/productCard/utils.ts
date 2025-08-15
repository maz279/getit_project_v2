
import { ProductStock, StockBadgeInfo } from './types';

export const getStockBadge = (stock: ProductStock): StockBadgeInfo => {
  switch (stock.status) {
    case 'in_stock':
      return { text: 'In Stock', textBn: 'সংগ্রহে আছে', color: 'bg-green-100 text-green-800' };
    case 'limited':
      return { text: 'Limited Stock', textBn: 'সীমিত সংগ্রহ', color: 'bg-orange-100 text-orange-800' };
    case 'out_of_stock':
      return { text: 'Out of Stock', textBn: 'স্টক নেই', color: 'bg-red-100 text-red-800' };
    case 'preorder':
      return { text: 'Pre-order', textBn: 'প্রি-অর্ডার', color: 'bg-blue-100 text-blue-800' };
    default:
      return { text: 'Unknown', textBn: 'অজানা', color: 'bg-gray-100 text-gray-800' };
  }
};

export const calculateDiscountPercentage = (price: number, originalPrice?: number): number => {
  return originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
};

export const paymentMethods = [
  { name: 'bKash', color: 'text-pink-600' },
  { name: 'Nagad', color: 'text-orange-600' },
  { name: 'Rocket', color: 'text-purple-600' },
  { name: 'COD', color: 'text-green-600' }
];
