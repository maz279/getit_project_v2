
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterLegalSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Legal Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-blue-300 mb-4">Terms & Policies</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/terms" className="text-sm text-gray-300 hover:text-white transition-colors block">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors block">Privacy Policy</Link>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Cookie Policy</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Vendor Agreement</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Intellectual Property Policy</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Prohibited Items Policy</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Community Guidelines</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Dispute Resolution</a>
          </div>
        </div>

        {/* Compliance & Certifications */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-yellow-300 mb-4">Regulatory Compliance</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">• Bangladesh Bank Approved</p>
            <p className="text-sm text-gray-300">• BTRC Registered</p>
            <p className="text-sm text-gray-300">• Trade License: TRAD/DHKN/1234/2024</p>
            <p className="text-sm text-gray-300">• TIN: 1234-5678-9012</p>
            <p className="text-sm text-gray-300">• VAT Registration: 3456-7890-1234</p>
            <p className="text-sm text-gray-300">• ISO 27001 Certified</p>
            <p className="text-sm text-gray-300">• GDPR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
};
