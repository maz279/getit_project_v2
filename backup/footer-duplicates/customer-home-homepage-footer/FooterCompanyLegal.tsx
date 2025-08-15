
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterCompanyLegal: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-blue-300 mb-4">Company & Legal</h4>
      <div className="space-y-2">
        <Link to="/about-us" className="text-sm text-gray-300 hover:text-white transition-colors block">About GETIT</Link>
        <Link to="/about-us" className="text-sm text-gray-300 hover:text-white transition-colors block">Our Story</Link>
        <Link to="/about-us" className="text-sm text-gray-300 hover:text-white transition-colors block">Leadership Team</Link>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Careers</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Press & Media</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Investor Relations</a>
        <Link to="/terms" className="text-sm text-gray-300 hover:text-white transition-colors block">Terms of Service</Link>
        <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors block">Privacy Policy</Link>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Cookie Policy</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Intellectual Property</a>
      </div>
    </div>
  );
};
