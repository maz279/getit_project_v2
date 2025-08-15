
import React from 'react';

export const FooterAppDownload: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-purple-300 mb-4">Download Our App</h4>
      <p className="text-sm text-gray-300">Shop on the go with exclusive app-only deals and faster checkout</p>
      <div className="flex space-x-3">
        <img
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
          alt="Download on App Store"
          className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
        />
        <img
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          alt="Get it on Google Play"
          className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
      
      {/* QR Code */}
      <div className="flex items-center space-x-3 mt-4">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-800 rounded grid grid-cols-3 gap-0.5 p-1">
            <div className="bg-white rounded-sm"></div>
            <div className="bg-gray-800 rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-gray-800 rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-gray-800 rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-gray-800 rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Scan QR Code</p>
          <p className="text-xs text-gray-400">Download mobile app instantly</p>
        </div>
      </div>
    </div>
  );
};
