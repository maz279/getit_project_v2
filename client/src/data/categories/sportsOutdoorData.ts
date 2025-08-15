
import React from 'react';
import { Dumbbell } from 'lucide-react';
import { MainCategory } from './types';

export const sportsOutdoorData: MainCategory = {
  id: 'sports-outdoor',
  name: 'Sports & Outdoor',
  icon: React.createElement(Dumbbell, { className: "w-6 h-6" }),
  color: 'bg-orange-500 text-white',
  count: 65432,
  subcategories: {
    'sports-equipment': {
      name: "Sports Equipment",
      subcategories: [
        { name: 'Cricket', count: 15678 },
        { name: 'Football', count: 12345 },
        { name: 'Badminton', count: 9876 },
        { name: 'Tennis', count: 8765 },
        { name: 'Swimming', count: 6543 }
      ]
    },
    'fitness-gym': {
      name: "Fitness & Gym",
      subcategories: [
        { name: 'Home Gym Equipment', count: 18976 },
        { name: 'Cardio Equipment', count: 12345 },
        { name: 'Strength Training', count: 9876 },
        { name: 'Yoga & Pilates', count: 8765 }
      ]
    },
    'outdoor-activities': {
      name: "Outdoor Activities",
      subcategories: [
        { name: 'Camping & Hiking', count: 12345 },
        { name: 'Fishing', count: 9876 },
        { name: 'Cycling', count: 8765 },
        { name: 'Water Sports', count: 6543 }
      ]
    }
  }
};
