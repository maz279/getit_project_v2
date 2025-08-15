
import React from 'react';
import { Home } from 'lucide-react';
import { MainCategory } from './types';

export const homeGardenData: MainCategory = {
  id: 'home-garden',
  name: 'Home & Garden',
  icon: React.createElement(Home, { className: "w-6 h-6" }),
  color: 'bg-green-500 text-white',
  count: 167234,
  featured: true,
  subcategories: {
    'furniture': {
      name: "Furniture",
      subcategories: [
        { name: 'Living Room Furniture', count: 28934 },
        { name: 'Bedroom Furniture', count: 23456 },
        { name: 'Dining Room Furniture', count: 15678 },
        { name: 'Office Furniture', count: 12345 },
        { name: 'Outdoor Furniture', count: 8765 }
      ]
    },
    'home-decor': {
      name: "Home Decor",
      subcategories: [
        { name: 'Wall Decor', count: 18976 },
        { name: 'Decorative Accessories', count: 15432 },
        { name: 'Lighting', count: 12345 },
        { name: 'Window Treatments', count: 9876 },
        { name: 'Rugs & Carpets', count: 11234 }
      ]
    },
    'kitchen-dining': {
      name: "Kitchen & Dining",
      subcategories: [
        { name: 'Cookware', count: 23456 },
        { name: 'Kitchen Tools & Gadgets', count: 18976 },
        { name: 'Dinnerware', count: 15678 },
        { name: 'Food Storage', count: 12345 },
        { name: 'Small Appliances', count: 9876 }
      ]
    },
    'bedding-bath': {
      name: "Bedding & Bath",
      subcategories: [
        { name: 'Bedding', count: 19876 },
        { name: 'Bath Towels & Linens', count: 15432 },
        { name: 'Bathroom Accessories', count: 12345 },
        { name: 'Pillows & Cushions', count: 8765 }
      ]
    },
    'garden-outdoor': {
      name: "Garden & Outdoor",
      subcategories: [
        { name: 'Gardening Tools', count: 15678 },
        { name: 'Plants & Seeds', count: 12345 },
        { name: 'Planters & Pots', count: 9876 },
        { name: 'Outdoor Decor', count: 8765 },
        { name: 'Lawn & Garden Care', count: 6543 }
      ]
    },
    'storage-organization': {
      name: "Storage & Organization",
      subcategories: [
        { name: 'Closet Organization', count: 12345 },
        { name: 'Storage Furniture', count: 9876 },
        { name: 'Garage & Utility', count: 8765 },
        { name: 'Laundry Organization', count: 6543 }
      ]
    }
  }
};
