
import React from 'react';
import { Share2, Link, Facebook, Twitter, MessageCircle, Mail, Copy, Users } from 'lucide-react';

export const WishlistSharing: React.FC = () => {
  const sharingOptions = [
    { name: 'Copy Link', icon: Copy, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { name: 'Email', icon: Mail, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Share2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Share Your Wishlist</h2>
          <p className="text-gray-600 text-sm">Let friends and family know what you want</p>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        {sharingOptions.map((option, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg ${option.bgColor} hover:scale-105 transition-transform duration-200`}
          >
            <option.icon className={`w-6 h-6 ${option.color}`} />
            <span className="text-xs font-medium text-gray-700">{option.name}</span>
          </button>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Shareable Link</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value="https://shopbd.com/wishlist/share/abc123"
            readOnly
            className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Copy
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>12 people viewed your wishlist this week</span>
      </div>
    </div>
  );
};
