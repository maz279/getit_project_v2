
import React from 'react';
import { Book } from 'lucide-react';
import { MainCategory } from './types';

export const booksEducationData: MainCategory = {
  id: 'books-education',
  name: 'Books & Education',
  icon: React.createElement(Book, { className: "w-6 h-6" }),
  color: 'bg-indigo-500 text-white',
  count: 87654,
  subcategories: {
    'academic-books': {
      name: "Academic Books",
      subcategories: [
        { name: 'School Books', count: 23456 },
        { name: 'University Books', count: 18976 },
        { name: 'Professional Books', count: 12345 },
        { name: 'Reference Books', count: 9876 }
      ]
    },
    'general-books': {
      name: "General Books",
      subcategories: [
        { name: 'Fiction', count: 15678 },
        { name: 'Non-Fiction', count: 12345 },
        { name: 'Religious Books', count: 9876 },
        { name: 'Children\'s Books', count: 8765 }
      ]
    },
    'stationery': {
      name: "Stationery & Office Supplies",
      subcategories: [
        { name: 'Writing Instruments', count: 12345 },
        { name: 'Paper Products', count: 9876 },
        { name: 'Art Supplies', count: 8765 },
        { name: 'Office Equipment', count: 6543 }
      ]
    }
  }
};
