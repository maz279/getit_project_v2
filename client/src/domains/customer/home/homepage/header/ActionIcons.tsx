
import React from 'react';
import { Link } from 'wouter';
import { Search, ShoppingCart, Heart } from 'lucide-react';
// Temporary fix - comment out authentication until context is resolved
// import { useCart } from '@/contexts/CartContext';
// import { useAuth } from '@/contexts/AuthContext';
import { UserProfileDropdown } from './UserProfileDropdown';
import { LanguageSelector } from './LanguageSelector';

interface ActionIconsProps {
  language: string;
}

export const ActionIcons: React.FC<ActionIconsProps> = ({ language }) => {
  // Temporary fix - use mock data until context is resolved
  const user = null;
  const cartItemsCount = 0;
  const [currentLanguage, setCurrentLanguage] = React.useState(language);

  const content = {
    EN: {
      search: "Search",
      wishlist: "Wishlist", 
      cart: "Cart"
    },
    BD: {
      search: "খুঁজুন",
      wishlist: "পছন্দের তালিকা",
      cart: "কার্ট"
    }
  };

  const currentContent = content[currentLanguage as keyof typeof content];

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Mobile Search Icon */}
      <button
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label={currentContent.search}
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label={currentContent.wishlist}
      >
        <Heart className="w-5 h-5" />
      </Link>

      {/* Shopping Cart */}
      <Link
        href="/cart"
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label={currentContent.cart}
      >
        <ShoppingCart className="w-5 h-5" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </Link>

      {/* Language Selector */}
      <LanguageSelector 
        language={currentLanguage} 
        onLanguageChange={handleLanguageChange} 
      />

      {/* User Profile Dropdown (only show if user is logged in) */}
      {user && (
        <UserProfileDropdown language={currentLanguage} />
      )}
    </div>
  );
};
