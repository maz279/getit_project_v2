
import React from 'react';
import { Heart } from 'lucide-react';
import { MainCategory } from './types';

export const healthBeautyData: MainCategory = {
  id: 'health-beauty',
  name: 'Health & Beauty',
  icon: React.createElement(Heart, { className: "w-6 h-6" }),
  color: 'bg-red-500 text-white',
  count: 134567,
  featured: true,
  subcategories: {
    'skincare': {
      name: "Skincare",
      subcategories: [
        { name: 'Face Care', count: 28934 },
        { name: 'Body Care', count: 23456 },
        { name: 'Anti-Aging', count: 15678 },
        { name: 'Natural & Organic', count: 12345 },
        { name: 'Men\'s Skincare', count: 8765 }
      ]
    },
    'makeup': {
      name: "Makeup & Cosmetics",
      subcategories: [
        { name: 'Face Makeup', count: 25678 },
        { name: 'Eye Makeup', count: 18976 },
        { name: 'Lip Care', count: 15432 },
        { name: 'Nail Care', count: 12345 },
        { name: 'Makeup Tools', count: 9876 }
      ]
    },
    'hair-care': {
      name: "Hair Care",
      subcategories: [
        { name: 'Shampoo & Conditioner', count: 23456 },
        { name: 'Hair Styling', count: 18976 },
        { name: 'Hair Tools', count: 15678 },
        { name: 'Hair Treatments', count: 12345 }
      ]
    },
    'personal-care': {
      name: "Personal Care",
      subcategories: [
        { name: 'Bath & Body', count: 19876 },
        { name: 'Oral Care', count: 15432 },
        { name: 'Deodorants & Perfumes', count: 12345 },
        { name: 'Shaving & Grooming', count: 9876 }
      ]
    },
    'health-wellness': {
      name: "Health & Wellness",
      subcategories: [
        { name: 'Vitamins & Supplements', count: 18976 },
        { name: 'Medical Supplies', count: 12345 },
        { name: 'Fitness Equipment', count: 9876 },
        { name: 'Health Monitors', count: 8765 }
      ]
    }
  }
};
