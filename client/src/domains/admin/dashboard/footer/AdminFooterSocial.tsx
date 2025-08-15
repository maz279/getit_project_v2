
import React from 'react';
import { Globe, Facebook, Linkedin, Twitter, Youtube, MessageCircle } from 'lucide-react';

export const AdminFooterSocial: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-pink-300 flex items-center space-x-1">
        <Globe size={12} />
        <span>Social Media & Communication</span>
      </h3>
      <div className="space-y-1 text-xs">
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Facebook size={8} className="text-blue-400" />
          <span>@GetItBangladesh</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Linkedin size={8} className="text-blue-300" />
          <span>GetIt Bangladesh</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Twitter size={8} className="text-sky-300" />
          <span>@GetItBD</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Youtube size={8} className="text-red-400" />
          <span>GetIt Platform</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <MessageCircle size={8} className="text-green-400" />
          <span>WhatsApp: +880-1700-654321</span>
        </a>
      </div>
    </div>
  );
};
