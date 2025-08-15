import React from 'react';
import { ChevronRight, Home, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';

export const BulkOrdersNavigationMap: React.FC = () => {
  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          <Link href="/business" className="text-gray-600 hover:text-blue-600">
            Business
          </Link>
          
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          <span className="text-gray-900 font-medium flex items-center">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Bulk Orders
          </span>
        </nav>
      </div>
    </div>
  );
};