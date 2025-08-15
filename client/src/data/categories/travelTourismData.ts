
import React from 'react';
import { Plane } from 'lucide-react';
import { MainCategory } from './types';

export const travelTourismData: MainCategory = {
  id: 'travel-tourism',
  name: 'Travel & Tourism',
  icon: React.createElement(Plane, { className: "w-6 h-6" }),
  color: 'bg-sky-600 text-white',
  count: 7321,
  subcategories: {
    'travel-gear': {
      name: "Travel Gear",
      subcategories: [
        { name: 'Luggage & Bags', count: 1876 },
        { name: 'Travel Accessories', count: 1654 },
        { name: 'Outdoor Gear', count: 1432 },
        { name: 'Navigation Tools', count: 1210 }
      ]
    },
    'tourism-services': {
      name: "Tourism Services",
      subcategories: [
        { name: 'Tour Packages', count: 1210 },
        { name: 'Hotel Bookings', count: 1098 },
        { name: 'Transport Services', count: 987 },
        { name: 'Travel Insurance', count: 876 }
      ]
    }
  }
};
