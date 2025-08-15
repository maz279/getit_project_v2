
import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle } from 'lucide-react';

export const FooterLegalSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-2 mb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legal Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <Scale className="w-3 h-3 mr-1" />
            Terms & Policies
          </h4>
          <div className="grid grid-cols-2 gap-1">
            <Link to="/terms" className="text-xs text-gray-300 hover:text-white transition-colors block">Terms of Service</Link>
            <Link to="/privacy" className="text-xs text-gray-300 hover:text-white transition-colors block">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-xs text-gray-300 hover:text-white transition-colors block">Cookie Policy</Link>
            <Link to="/vendor-agreement" className="text-xs text-gray-300 hover:text-white transition-colors block">Vendor Agreement</Link>
            <Link to="/intellectual-property" className="text-xs text-gray-300 hover:text-white transition-colors block">IP Policy</Link>
            <Link to="/prohibited-items" className="text-xs text-gray-300 hover:text-white transition-colors block">Prohibited Items</Link>
            <Link to="/community-guidelines" className="text-xs text-gray-300 hover:text-white transition-colors block">Guidelines</Link>
            <Link to="/dispute-resolution" className="text-xs text-gray-300 hover:text-white transition-colors block">Dispute Resolution</Link>
          </div>
        </div>

        {/* Compliance & Certifications */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliance
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• Bangladesh Bank Approved</p>
            <p className="text-xs text-gray-300">• BTRC Registered</p>
            <p className="text-xs text-gray-300">• Trade License: TRAD/2024</p>
            <p className="text-xs text-gray-300">• ISO 27001 Certified</p>
            <p className="text-xs text-gray-300">• GDPR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
};
