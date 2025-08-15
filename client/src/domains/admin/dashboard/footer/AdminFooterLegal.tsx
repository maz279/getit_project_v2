
import React from 'react';
import { ShieldCheck, Shield, Lock, Users, Eye, FileText, Book, FileQuestion } from 'lucide-react';

export const AdminFooterLegal: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-yellow-300 flex items-center space-x-1">
        <ShieldCheck size={12} />
        <span>Legal & Compliance</span>
      </h3>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Shield size={8} className="text-blue-300" />
          <span>Terms of Service</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Lock size={8} className="text-green-300" />
          <span>Privacy Policy</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Users size={8} className="text-purple-300" />
          <span>Admin User Agreement</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Eye size={8} className="text-orange-300" />
          <span>Data Protection Policy</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <FileText size={8} className="text-rose-300" />
          <span>Cookie Policy</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Book size={8} className="text-cyan-300" />
          <span>Compliance Documentation</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <FileQuestion size={8} className="text-indigo-300" />
          <span>Regulatory Information</span>
        </a>
      </div>
    </div>
  );
};
