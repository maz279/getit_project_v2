
import React from 'react';
import { AlertCircle, Phone, PhoneCall, Construction, Activity, Mail } from 'lucide-react';

export const AdminFooterEmergency: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-red-300 flex items-center space-x-1">
        <AlertCircle size={12} />
        <span>Emergency & Maintenance</span>
      </h3>
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center space-x-1">
          <Phone size={8} className="text-red-300" />
          <span>Emergency: +880-1700-999888</span>
        </div>
        <div className="flex items-center space-x-1">
          <PhoneCall size={8} className="text-orange-300" />
          <span>24/7 Hotline: +880-1700-247365</span>
        </div>
        <div className="flex items-center space-x-1">
          <Construction size={8} className="text-yellow-300" />
          <span>Maintenance: Sat 2:00-4:00 AM</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity size={8} className="text-green-300" />
          <span>Status: status.getit.com.bd</span>
        </div>
        <div className="flex items-center space-x-1">
          <Mail size={8} className="text-blue-300" />
          <span>Incidents: incidents@getit.com.bd</span>
        </div>
      </div>
    </div>
  );
};
