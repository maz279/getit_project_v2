
import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

export const FooterContact: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-green-300 mb-4">Get in Touch</h4>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">GetIt Headquarters</p>
            <p className="text-sm">House 123, Road 12</p>
            <p className="text-sm">Dhanmondi, Dhaka 1205</p>
            <p className="text-sm">Bangladesh</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold">Customer Service</p>
            <p className="text-sm">+880 1700 123456</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-semibold">WhatsApp</p>
            <p className="text-sm">+880 1700 123456</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-semibold">Email Support</p>
            <p className="text-sm">support@getit.com.bd</p>
            <p className="text-xs text-gray-400">vendors@getit.com.bd</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-yellow-400" />
          <p className="text-sm">24/7 Customer Support</p>
        </div>
      </div>
    </div>
  );
};
