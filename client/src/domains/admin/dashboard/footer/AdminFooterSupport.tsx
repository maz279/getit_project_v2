
import React from 'react';
import { Headphones, FileText, MessageCircle, PhoneCall, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const AdminFooterSupport: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-green-300 flex items-center space-x-1">
        <Headphones size={12} />
        <span>Quick Support Links</span>
      </h3>
      <div className="space-y-1 text-xs">
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <FileText size={8} className="text-blue-300" />
          <span>Submit Support Ticket</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <MessageCircle size={8} className="text-green-300" />
          <span>Live Chat Support</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <PhoneCall size={8} className="text-purple-300" />
          <span>Call Support Hotline</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <AlertTriangle size={8} className="text-red-300" />
          <span>Emergency Technical Support</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <ShieldCheck size={8} className="text-orange-300" />
          <span>Report Security Issue</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Zap size={8} className="text-yellow-300" />
          <span>Feature Request</span>
        </a>
      </div>
    </div>
  );
};
