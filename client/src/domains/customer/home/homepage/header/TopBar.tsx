
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Globe, Shield, Lock, Award, Store, LogIn, UserPlus, MessageCircle, HeadphonesIcon } from 'lucide-react';
// Temporary fix - comment out authentication until context is resolved
// import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  language: string;
  toggleLanguage: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ language, toggleLanguage }) => {
  // Temporary fix - use mock data until context is resolved
  const user = null;
  const logout = () => {};
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const content = {
    EN: {
      hotline: "Hotline: 16263 (24/7 Customer Support)",
      location: "Dhaka, Bangladesh",
      becomeVendor: "Become a Vendor",
      liveChat: "Live Chat",
      support247: "24/7 Support",
      secure: "Secure",
      verified: "Verified",
      myAccount: "My Account",
      logout: "Logout",
      signIn: "Sign In",
      signUp: "Sign Up"
    },
    BD: {
      hotline: "হটলাইন: ১৬২৬৩ (২৪/৭ গ্রাহক সেবা)",
      location: "ঢাকা, বাংলাদেশ",
      becomeVendor: "বিক্রেতা হন",
      liveChat: "লাইভ চ্যাট",
      support247: "২৪/৭ সাপোর্ট",
      secure: "নিরাপদ",
      verified: "যাচাইকৃত",
      myAccount: "আমার অ্যাকাউন্ট",
      logout: "লগআউট",
      signIn: "লগইন",
      signUp: "নিবন্ধন"
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className="bg-gray-800 text-white py-2 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>{currentContent.hotline}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>{currentContent.location}</span>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>{language === 'EN' ? 'English | বাংলা' : 'ইংরেজি | বাংলা'}</span>
          </button>
        </div>

        {/* Right Side - Trust Indicators, Become Vendor, Auth */}
        <div className="flex items-center gap-4 text-xs">
          {/* Trust Indicators */}
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{currentContent.secure}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>SSL</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{currentContent.verified}</span>
            </div>
          </div>

          <span className="text-gray-400">|</span>

          {/* Become a Vendor */}
          <Link 
            to="/vendor/register" 
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
          >
            <Store className="w-3 h-3" />
            {currentContent.becomeVendor}
          </Link>

          <span className="text-gray-400">|</span>

          {/* Live Chat */}
          <Link 
            to="/help-center" 
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            {currentContent.liveChat}
          </Link>

          {/* 24/7 Support */}
          <Link 
            to="/help-center" 
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
          >
            <HeadphonesIcon className="w-3 h-3" />
            {currentContent.support247}
          </Link>

          <span className="text-gray-400">|</span>

          {/* Authentication */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/account" className="hover:text-yellow-300 transition-colors">
                {currentContent.myAccount}
              </Link>
              <button 
                onClick={handleSignOut}
                className="hover:text-yellow-300 transition-colors"
              >
                {currentContent.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/auth/login" 
                className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
              >
                <LogIn className="w-3 h-3" />
                {currentContent.signIn}
              </Link>
              <Link 
                to="/auth/register" 
                className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                {currentContent.signUp}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
