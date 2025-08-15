
import React from 'react';
import { Star, TrendingUp, Target, Award } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const FeaturedProductsHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products Management</h1>
            <p className="text-gray-600 mt-1">Manage and optimize your featured product placements across the platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics Report
          </Button>
          <Button variant="outline" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
          <Button className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600">
            <Award className="h-4 w-4 mr-2" />
            Feature Product
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Premium Placement</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximize product visibility</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Performance Tracking</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Real-time analytics & insights</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Smart Campaigns</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Automated featured product campaigns</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Quality Control</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Maintain high-quality standards</p>
        </div>
      </div>
    </div>
  );
};
