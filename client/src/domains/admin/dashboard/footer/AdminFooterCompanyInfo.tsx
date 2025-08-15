
import React from 'react';
import { MapPin, Phone, Mail, Clock, AlertTriangle } from 'lucide-react';

export const AdminFooterCompanyInfo: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">G</span>
        </div>
        <h3 className="text-xs font-bold text-emerald-300">GetIt Platform</h3>
      </div>
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-start space-x-1">
          <MapPin className="text-emerald-300 mt-0.5" size={10} />
          <span>Shahir Smart Tower 205/1 & 205/1/A, West Kafrul, Taltola, Dhaka-1207</span>
        </div>
        <div className="flex items-center space-x-1">
          <Phone className="text-sky-300" size={10} />
          <span>+880-2-9876543</span>
        </div>
        <div className="flex items-center space-x-1">
          <Mail className="text-violet-300" size={10} />
          <span>admin@getit.com.bd</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="text-amber-300" size={10} />
          <span>Sunday-Thursday, 9:00 AM - 6:00 PM</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertTriangle className="text-red-300" size={10} />
          <span>Emergency: +880-1700-123456</span>
        </div>
      </div>
    </div>
  );
};
