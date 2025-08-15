import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Building, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export const BulkOrdersHero: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Building className="w-4 h-4 mr-2" />
            Business Solutions
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bulk Orders & Wholesale Prices
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            Get wholesale prices for bulk orders. Custom quotes, business solutions, and bulk discounts for businesses, retailers, and organizations in Bangladesh.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Request Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              Business Registration
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wholesale Prices</h3>
              <p className="text-blue-100">Get up to 50% discount on bulk orders</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <Building className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Support</h3>
              <p className="text-blue-100">Dedicated account manager for B2B clients</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Solutions</h3>
              <p className="text-blue-100">Tailored solutions for your business needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};