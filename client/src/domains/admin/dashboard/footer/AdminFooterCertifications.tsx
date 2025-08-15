
import React from 'react';
import { Award, Shield, CreditCard, Lock, Globe, Zap, Truck, Building, Heart, Code, Layers, Cloud } from 'lucide-react';

export const AdminFooterCertifications: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-600">
      {/* Certifications */}
      <div>
        <h3 className="text-xs font-bold text-purple-300 flex items-center space-x-1 mb-2">
          <Award size={12} />
          <span>Compliance & Certifications</span>
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Shield size={8} className="text-green-300" />
            <span className="text-gray-300">PCI DSS</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award size={8} className="text-blue-300" />
            <span className="text-gray-300">ISO 27001</span>
          </div>
          <div className="flex items-center space-x-1">
            <CreditCard size={8} className="text-yellow-300" />
            <span className="text-gray-300">BB Approved</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock size={8} className="text-green-300" />
            <span className="text-gray-300">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe size={8} className="text-blue-300" />
            <span className="text-gray-300">GDPR</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap size={8} className="text-purple-300" />
            <span className="text-gray-300">SOC 2 Type II</span>
          </div>
        </div>
      </div>

      {/* Technology Partners */}
      <div>
        <h3 className="text-xs font-bold text-orange-300 flex items-center space-x-1 mb-2">
          <Truck size={12} />
          <span>Technology Partners</span>
        </h3>
        <div className="space-y-1 text-xs text-gray-300">
          <div>
            <span className="text-blue-300 font-medium">Payment:</span> bKash, Nagad, Rocket, SSL Commerz
          </div>
          <div>
            <span className="text-green-300 font-medium">Shipping:</span> Pathao, Paperfly, Sundarban, RedX, eCourier
          </div>
          <div>
            <span className="text-purple-300 font-medium">Cloud:</span> AWS, CloudFlare, New Relic
          </div>
        </div>
      </div>
    </div>
  );
};
