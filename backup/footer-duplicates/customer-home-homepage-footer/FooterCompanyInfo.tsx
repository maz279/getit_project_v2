
import React from 'react';
import { Shield, Truck, CreditCard } from 'lucide-react';

export const FooterCompanyInfo: React.FC = () => {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold">G</span>
        </div>
        <h3 className="text-2xl font-bold">GETIT</h3>
      </div>
      <p className="text-green-300 text-lg font-semibold mb-2">
        Best ecommerce platform in Bangladesh
      </p>
      <p className="text-gray-300 text-sm leading-relaxed">
        Bangladesh's leading multi-vendor marketplace connecting millions of buyers with trusted sellers. 
        Discover endless possibilities with secure transactions, fast delivery, and world-class customer service.
      </p>
      <div className="space-y-2">
        <p className="text-sm"><span className="font-semibold">Founded:</span> 2018</p>
        <p className="text-sm"><span className="font-semibold">Headquarters:</span> Dhaka, Bangladesh</p>
        <p className="text-sm"><span className="font-semibold">Registered Vendors:</span> 50K+</p>
        <p className="text-sm"><span className="font-semibold">Products Listed:</span> 5M+</p>
        <p className="text-sm"><span className="font-semibold">Daily Orders:</span> 100K+</p>
      </div>
      
      {/* Trust Badges */}
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-xs">SSL Secured</span>
        </div>
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span className="text-xs">Secure Payment</span>
        </div>
        <div className="flex items-center space-x-1">
          <Truck className="w-4 h-4 text-orange-400" />
          <span className="text-xs">Fast Delivery</span>
        </div>
      </div>
    </div>
  );
};
