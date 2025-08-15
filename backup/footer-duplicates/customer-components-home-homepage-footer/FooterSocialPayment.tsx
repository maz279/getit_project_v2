
import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

export const FooterSocialPayment: React.FC = () => {
  return (
    <div className="border-t border-gray-700 mt-8 pt-8">
      <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
        
        {/* Social Media */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold">Follow Us:</span>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold">We Accept:</span>
            <div className="flex space-x-2">
              {/* Credit Cards */}
              <div className="w-12 h-8 bg-blue-600 rounded text-xs flex items-center justify-center font-bold text-white">VISA</div>
              <div className="w-12 h-8 bg-red-600 rounded text-xs flex items-center justify-center font-bold text-white">MC</div>
              <div className="w-12 h-8 bg-blue-500 rounded text-xs flex items-center justify-center font-bold text-white">AMEX</div>
              
              {/* Mobile Banking */}
              <div className="w-12 h-8 bg-pink-500 rounded text-xs flex items-center justify-center font-bold text-white">bKash</div>
              <div className="w-12 h-8 bg-orange-500 rounded text-xs flex items-center justify-center font-bold text-white">Nagad</div>
              <div className="w-12 h-8 bg-purple-600 rounded text-xs flex items-center justify-center font-bold text-white">Rocket</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
