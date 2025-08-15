
import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

export const FooterContact: React.FC = () => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
        <MessageCircle className="w-3 h-3 mr-1" />
        Get in Touch
      </h4>
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <MapPin className="w-3 h-3 text-blue-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium">GetIt HQ</p>
            <p className="text-xs">Dhanmondi, Dhaka 1205</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-3 h-3 text-green-400" />
          <div>
            <p className="text-xs font-medium">+880 1700 123456</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="w-3 h-3 text-red-400" />
          <div>
            <p className="text-xs font-medium">support@getit.com.bd</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-yellow-400" />
          <p className="text-xs">24/7 Support</p>
        </div>
      </div>
    </div>
  );
};
