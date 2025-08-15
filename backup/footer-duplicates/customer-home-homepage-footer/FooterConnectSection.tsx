
import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

export const FooterConnectSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Social Media */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-blue-300 mb-2">Follow GetIt</h4>
          <div className="flex space-x-2 mb-2">
            <a href="https://facebook.com/getitbd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Facebook className="w-4 h-4 text-white" />
            </a>
            <a href="https://instagram.com/getit_bangladesh" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
              <Instagram className="w-4 h-4 text-white" />
            </a>
            <a href="https://linkedin.com/company/getit-bangladesh" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://youtube.com/getitbangladesh" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-gray-400">Facebook: facebook.com/getitbd</p>
            <p className="text-xs text-gray-400">Instagram: @getit_bangladesh</p>
            <p className="text-xs text-gray-400">LinkedIn: linkedin.com/company/getit-bangladesh</p>
            <p className="text-xs text-gray-400">YouTube: GetIt Bangladesh</p>
          </div>
        </div>

        {/* Mobile Applications */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-purple-300 mb-2">Download Our Apps</h4>
          <div className="flex space-x-2 mb-2">
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on App Store"
              className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            />
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-gray-400">• Google Play Store</p>
            <p className="text-xs text-gray-400">• Apple App Store</p>
            <p className="text-xs text-gray-400">• Huawei AppGallery</p>
            <p className="text-xs text-gray-400">• Progressive Web App (PWA)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
