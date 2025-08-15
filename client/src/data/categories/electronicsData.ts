
import React from 'react';
import { Smartphone } from 'lucide-react';
import { MainCategory } from './types';

export const electronicsData: MainCategory = {
  id: 'electronics',
  name: 'Electronics & Gadgets',
  icon: React.createElement(Smartphone, { className: "w-6 h-6" }),
  color: 'bg-blue-500 text-white',
  count: 189456,
  featured: true,
  subcategories: {
    'mobile-tablets': {
      name: "Mobile & Tablets",
      subcategories: [
        { name: 'Smartphones', count: 45678 },
        { name: 'Tablets', count: 12345 },
        { name: 'Mobile Accessories', count: 28934 },
        { name: 'Smartwatches & Wearables', count: 15678 },
        { name: 'Power Banks', count: 18976 }
      ]
    },
    'computers': {
      name: "Computers & Laptops",
      subcategories: [
        { name: 'Laptops', count: 23456 },
        { name: 'Desktop Computers', count: 8765 },
        { name: 'Computer Components', count: 15432 },
        { name: 'Computer Accessories', count: 19876 },
        { name: 'Printers & Scanners', count: 6543 }
      ]
    },
    'audio-video': {
      name: "Audio & Video",
      subcategories: [
        { name: 'Headphones & Earphones', count: 34567 },
        { name: 'Speakers & Sound Systems', count: 18976 },
        { name: 'Cameras & Photography', count: 12345 },
        { name: 'TVs & Displays', count: 15678 },
        { name: 'Home Theater', count: 8765 }
      ]
    },
    'gaming': {
      name: "Gaming",
      subcategories: [
        { name: 'Gaming Consoles', count: 9876 },
        { name: 'Gaming Accessories', count: 15432 },
        { name: 'PC Gaming', count: 12345 },
        { name: 'Mobile Gaming', count: 8765 }
      ]
    },
    'appliances': {
      name: "Home Appliances",
      subcategories: [
        { name: 'Kitchen Appliances', count: 23456 },
        { name: 'Cleaning Appliances', count: 12345 },
        { name: 'Personal Care Appliances', count: 15678 },
        { name: 'Air Conditioning', count: 8765 }
      ]
    }
  }
};
