
import React from 'react';

export const FooterBusinessSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-green-300 mb-4">GetIt Bangladesh Limited</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Corporate Office: House 123, Road 12, Gulshan-2, Dhaka-1212</p>
            <p className="text-sm text-gray-300">Registered Address: House 123, Road 12, Dhaka, Bangladesh</p>
            <p className="text-sm text-gray-300">Business Registration: C-123456/24</p>
            <p className="text-sm text-gray-300">Authorized Capital: BDT 50,00,00,000</p>
            <p className="text-sm text-gray-300">Paid-up Capital: BDT 10,00,00,000</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-purple-300 mb-4">Get In Touch</h4>
          <div className="space-y-2">
            <a href="mailto:info@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Corporate Email: info@getit.com.bd</a>
            <a href="mailto:business@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Business Development: business@getit.com.bd</a>
            <a href="mailto:media@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Media Inquiries: media@getit.com.bd</a>
            <a href="mailto:investors@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Investor Relations: investors@getit.com.bd</a>
            <a href="mailto:legal@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Legal: legal@getit.com.bd</a>
          </div>
        </div>
      </div>
    </div>
  );
};
