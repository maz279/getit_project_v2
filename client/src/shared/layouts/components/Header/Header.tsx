
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, User, ShoppingCart, Heart, Bell, Mic, Camera, QrCode, Globe, ChevronDown, Menu, X, Settings, Star, Truck, Headphones, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';
import { useTranslation, logger } from '../../../translation';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';
import { AISearchBar } from '@/features/search/components/AISearchBar';
import { useLocation } from '@/shared/hooks/useLocation';
import { HeaderProps, HeaderState, SearchSuggestion } from '@/shared/types/header.types';
import { Location, getPopularLocations, bangladeshLocations } from '@/shared/data/bangladesh-locations';
import DynamicThemeSwitcher from '@/shared/components/theme/DynamicThemeSwitcher';

const Header: React.FC<HeaderProps> = ({ 
  className = '', 
  onSearch, 
  onSearchLoading,
  cartCount = 2,
  wishlistCount = 7,
  notificationCount = 3,
  isAuthenticated = false,
  userProfile,
  onCartClick,
  onWishlistClick,
  onUserClick,
  onLoginClick,
  onSignupClick,
  variant = 'default',
  sticky = true,
  onLocationChange
}) => {
  // Location management using custom hook
  const {
    selectedLocation,
    filteredLocations,
    locationSearchQuery,
    setLocationSearchQuery,
    handleLocationSelect,
    loadPopularLocations
  } = useLocation(1);

  // Get popular locations separately for permanent display
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  
  useEffect(() => {
    // Load popular locations on component mount
    const popular = getPopularLocations();
    setPopularLocations(popular);
    logger.info('Popular locations loaded', { count: popular.length });
  }, []);

  // Header state management
  const [headerState, setHeaderState] = useState<Partial<HeaderState>>({
    searchQuery: '',
    showSearchDropdown: false,
    showUserMenu: false,
    showVendorMenu: false,
    showCategoriesMenu: false,
    showLocationMenu: false,
    isVoiceSearchActive: false,
    isImageSearchActive: false,
    isQRScannerActive: false,
  });

  const { language, setLanguage } = useSimpleLanguage();
  const { t } = useTranslation();
  
  // Refs for accessibility and keyboard navigation
  const headerRef = useRef<HTMLElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const vendorMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Mock search suggestions - Move to separate service later
  const mockSuggestions: SearchSuggestion[] = [
    { id: 1, text: 'iPhone 15 Pro', category: 'Electronics', trend: 'hot' },
    { id: 2, text: 'Samsung Galaxy S24', category: 'Electronics', trend: 'trending' },
    { id: 3, text: 'MacBook Pro M3', category: 'Computers', trend: 'new' },
    { id: 4, text: 'AirPods Pro', category: 'Audio', trend: 'popular' },
    { id: 5, text: 'PlayStation 5', category: 'Gaming', trend: 'hot' }
  ];
  // Event handlers with proper error handling
  const handleQRScanner = () => {
    setHeaderState(prev => ({ 
      ...prev, 
      isQRScannerActive: !prev.isQRScannerActive 
    }));
    if (!headerState.isQRScannerActive) {
      logger.info('QR scanner activated');
    }
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    try {
      if (action === 'login' && onLoginClick) {
        onLoginClick();
      } else if (action === 'signup' && onSignupClick) {
        onSignupClick();
      } else {
        // Fallback navigation
        navigate(action === 'login' ? '/auth/login' : '/auth/signup');
      }
    } catch (error) {
      logger.error('Auth action failed', { action, error: error instanceof Error ? error.message : error });
    }
  };

  const handleVendorAction = (action: 'register' | 'login') => {
    try {
      if (action === 'register') {
        navigate('/vendor/register');
      } else if (action === 'login') {
        navigate('/vendor/login');
      }
    } catch (error) {
      logger.error('Vendor action failed', { action, error: error instanceof Error ? error.message : error });
    }
  };

  // Location change handler - notifies parent component and closes dropdown
  const handleLocationChange = (location: Location) => {
    handleLocationSelect(location);
    if (onLocationChange) {
      onLocationChange(location);
    }
    // Close the location dropdown after selection
    setHeaderState(prev => ({ 
      ...prev, 
      showLocationMenu: false 
    }));
    // Clear search query after selection
    setLocationSearchQuery('');
  };

  // Categories for dropdown - Using centralized translation system
  const categories = [
    { id: 'electronics', name: t('categories.electronics'), icon: '📱' },
    { id: 'fashion', name: t('categories.fashion'), icon: '👗' },
    { id: 'home', name: t('categories.home'), icon: '🏠' },
    { id: 'beauty', name: t('categories.beauty'), icon: '💄' },
    { id: 'sports', name: t('categories.sports'), icon: '⚽' },
    { id: 'books', name: t('categories.books'), icon: '📚' },
    { id: 'automotive', name: t('categories.automotive'), icon: '🚗' },
    { id: 'grocery', name: t('categories.grocery'), icon: '🛒' }
  ];

  // Event handlers with proper dropdown management
  const toggleLocationMenu = () => {
    setHeaderState(prev => ({ 
      ...prev, 
      showLocationMenu: !prev.showLocationMenu,
      showSearchDropdown: false,
      showUserMenu: false,
      showVendorMenu: false,
      showCategoriesMenu: false
    }));
  };

  const toggleSearchDropdown = () => {
    setHeaderState(prev => ({ 
      ...prev, 
      showSearchDropdown: !prev.showSearchDropdown,
      showLocationMenu: false,
      showUserMenu: false,
      showVendorMenu: false,
      showCategoriesMenu: false
    }));
  };

  // Click outside handler - Enhanced for all dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      setHeaderState(prev => ({
        ...prev,
        showLocationMenu: prev.showLocationMenu && target.closest('.location-menu-container') !== null,
        showSearchDropdown: prev.showSearchDropdown && target.closest('.search-dropdown-container') !== null,
        showUserMenu: prev.showUserMenu && target.closest('.user-menu-container') !== null,
        showVendorMenu: prev.showVendorMenu && target.closest('.vendor-menu-container') !== null,
        showCategoriesMenu: prev.showCategoriesMenu && target.closest('.categories-menu-container') !== null,
      }));
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add keyboard navigation for menus
  useKeyboardNavigation(headerState.showLocationMenu || false, {
    onEscape: () => setHeaderState(prev => ({ ...prev, showLocationMenu: false })),
  });
  
  useKeyboardNavigation(headerState.showVendorMenu || false, {
    onEscape: () => setHeaderState(prev => ({ ...prev, showVendorMenu: false })),
  });
  
  // Add click outside handlers
  useOnClickOutside(locationMenuRef, () => {
    if (headerState.showLocationMenu) {
      setHeaderState(prev => ({ ...prev, showLocationMenu: false }));
    }
  });
  
  useOnClickOutside(vendorMenuRef, () => {
    if (headerState.showVendorMenu) {
      setHeaderState(prev => ({ ...prev, showVendorMenu: false }));
    }
  });

  return (
    <>
      {/* Compact Professional Header */}
      <div 
        ref={headerRef}
        className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white shadow-xl relative z-[90]"
        role="banner"
        aria-label={t('navigation.main')}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-2 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute top-4 right-1/3 w-1 h-1 bg-green-400 rounded-full opacity-50 animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row - Compact */}
          <div className="flex items-center justify-between py-1 text-2xs border-b border-white/10">
            <div className="flex items-center space-x-3">
              {/* 24/7 Support - Moved to far left for better visibility */}
              <div className="flex items-center space-x-1">
                <Headphones className="h-2 w-2 text-blue-300" />
                <button 
                  onClick={() => navigate('/customer-support')}
                  className="text-white/90 hover:text-blue-300 transition-colors duration-200 hover:bg-blue-700/30 px-1 py-0.5 rounded-md text-2xs"
                  aria-label={t('support.24_7')}
                  role="button"
                >
                  {t('support.24_7')}
                </button>
              </div>
              
              {/* Location Selector */}
              <div className="flex items-center space-x-1">
                <MapPin className="h-2 w-2 text-yellow-400" />
                <span className="text-white/80 text-2xs">
                  {t('delivery.deliver_to')}
                </span>
                <div className="relative location-menu-container">
                  <button 
                    onClick={toggleLocationMenu}
                    className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center space-x-1 text-2xs"
                    aria-expanded={headerState.showLocationMenu}
                    aria-haspopup="true"
                    aria-controls="location-dropdown"
                    aria-label={t('location.select_delivery_area')}
                    role="button"
                  >
                    <span>{selectedLocation.city}</span>
                    <ChevronDown className="h-1.5 w-1.5" aria-hidden="true" />
                  </button>
                  
                  {/* Location Dropdown Menu */}
                  {headerState.showLocationMenu && (
                    <div 
                      ref={locationMenuRef}
                      id="location-dropdown"
                      className="fixed top-16 left-4 mt-2 w-96 bg-white rounded-lg shadow-xl border z-[150] max-h-96 overflow-y-auto"
                      role="menu"
                      aria-labelledby="location-button"
                      aria-orientation="vertical"
                    >
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {language === 'bn' ? 'ডেলিভারি এলাকা নির্বাচন করুন' : 'Select Delivery Area'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {language === 'bn' ? 'আপনার এলাকা নির্বাচন করুন দ্রুত ডেলিভারি ও সঠিক মূল্যের জন্য' : 'Choose your area for faster delivery and accurate pricing'}
                        </p>
                        
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'শহর বা এলাকা খুঁজুন...' : 'Search for city or area...'}
                            value={locationSearchQuery}
                            onChange={(e) => {
                              const searchValue = e.target.value;
                              logger.debug('Location search query changed', { query: searchValue });
                              setLocationSearchQuery(searchValue);
                            }}
                            onFocus={() => {
                              logger.debug('Location search input focused');
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder:text-gray-500"
                            aria-label={language === 'bn' ? 'শহর বা এলাকা খুঁজুন' : 'Search for city or area'}
                            role="searchbox"
                            aria-autocomplete="list"
                            style={{ 
                              color: '#111827 !important', 
                              backgroundColor: '#ffffff !important',
                              fontSize: '14px',
                              fontFamily: 'Inter, system-ui, sans-serif'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Search Results */}
                      {locationSearchQuery.trim() !== '' && (
                        <div className="p-4 border-b">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Search className="h-4 w-4 text-gray-500 mr-1" />
                            {language === 'bn' ? 'অনুসন্ধান ফলাফল' : 'Search Results'}
                          </h4>
                          <div className="space-y-2">
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((location) => (
                                <button
                                  key={location.id}
                                  onClick={() => handleLocationChange(location)}
                                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedLocation.id === location.id
                                      ? 'bg-blue-50 border-blue-200 border-2'
                                      : 'border border-gray-100 hover:bg-gray-50 hover:border-blue-200'
                                  }`}
                                >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <div>
                                      <div className="font-medium text-gray-800">{location.city}</div>
                                      <div className="text-sm text-gray-600">{location.region}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-green-600 font-medium">{location.deliveryTime}</div>
                                    {location.metro && (
                                      <div className="text-xs text-blue-600 flex items-center">
                                        <Truck className="h-3 w-3 mr-1" />
                                        {language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Express Delivery'}
                                      </div>
                                    )}
                                    {selectedLocation.id === location.id && (
                                      <div className="text-xs text-blue-600 font-medium">
                                        {language === 'bn' ? 'নির্বাচিত' : 'Selected'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-gray-500">
                                {language === 'bn' ? 'কোনো অবস্থান পাওয়া যায়নি' : 'No locations found'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Popular Locations - Always visible */}
                      <div className="p-4 border-b">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {language === 'bn' ? 'জনপ্রিয় এলাকা' : 'Popular Areas'}
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {popularLocations.length > 0 ? popularLocations.map((location) => (
                            <button
                              key={location.id}
                              onClick={() => handleLocationChange(location)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedLocation.id === location.id
                                  ? 'bg-blue-50 border-blue-200 border-2'
                                  : 'border border-gray-100 hover:bg-gray-50 hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-gray-800">{location.city}</div>
                                    <div className="text-sm text-gray-600">{location.region}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-green-600 font-medium">{location.deliveryTime}</div>
                                  {location.metro && (
                                    <div className="text-xs text-blue-600 flex items-center">
                                      <Truck className="h-3 w-3 mr-1" />
                                      {language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Express Delivery'}
                                    </div>
                                  )}
                                  {selectedLocation.id === location.id && (
                                    <div className="text-xs text-blue-600 font-medium">
                                      {language === 'bn' ? 'নির্বাচিত' : 'Selected'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          )) : (
                            <div className="p-3 text-center text-gray-500">
                              {language === 'bn' ? 'জনপ্রিয় এলাকা লোড হচ্ছে...' : 'Loading popular areas...'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* All Districts - Show all 64 districts */}
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <MapPin className="h-4 w-4 text-blue-500 mr-1" />
                          {language === 'bn' ? 'সকল জেলা (৬৪টি)' : 'All Districts (64)'}
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {bangladeshLocations.map((location) => (
                            <button
                              key={location.id}
                              onClick={() => handleLocationChange(location)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedLocation.id === location.id
                                  ? 'bg-blue-50 border-blue-200 border-2'
                                  : 'border border-gray-100 hover:bg-gray-50 hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-gray-800">{location.city}</div>
                                    <div className="text-sm text-gray-600">{location.region}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-green-600 font-medium">{location.deliveryTime}</div>
                                  {location.metro && (
                                    <div className="text-xs text-blue-600 flex items-center">
                                      <Truck className="h-3 w-3 mr-1" />
                                      {language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Express Delivery'}
                                    </div>
                                  )}
                                  {selectedLocation.id === location.id && (
                                    <div className="text-xs text-blue-600 font-medium">
                                      {language === 'bn' ? 'নির্বাচিত' : 'Selected'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Top Right - Compact Services */}
            <div className="flex items-center space-x-2 text-white/90 text-2xs">
              {/* GetIt Premium */}
              <div className="flex items-center space-x-1">
                <Star className="h-1.5 w-1.5 text-yellow-400" />
                <span className="hover:text-yellow-400 cursor-pointer">
                  {language === 'bn' ? 'প্রিমিয়াম' : 'Premium'}
                </span>
              </div>
              
              {/* Free Delivery Info */}
              <div className="flex items-center space-x-1">
                <Truck className="h-1.5 w-1.5 text-green-400" />
                <span className="hidden md:block">
                  {language === 'bn' ? 'ফ্রি ডেলিভারি ৳৫০০+' : 'Free Delivery ৳500+'}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-1 hover:bg-blue-600 rounded-md transition-colors">
                  <Bell className="h-3 w-3" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-2xs">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Wishlist */}
              <div className="relative">
                <button className="relative p-1 hover:bg-pink-600 rounded-md transition-colors">
                  <Heart className="h-3 w-3" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-2xs">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Vendor Registration */}
              <div className="relative vendor-menu-container">
                <button
                  onClick={() => setHeaderState(prev => ({ ...prev, showVendorMenu: !prev.showVendorMenu }))}
                  className="text-white/90 hover:text-yellow-400 flex items-center space-x-1 text-2xs"
                >
                  <span>{language === 'bn' ? 'বিক্রেতা হন' : 'Become a Vendor'}</span>
                  <ChevronDown className="h-1 w-1" />
                </button>
                
                {/* Vendor Dropdown Menu */}
                {headerState.showVendorMenu && (
                  <div className="fixed top-16 right-4 mt-2 w-64 bg-white rounded-lg shadow-xl border z-[150]">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {language === 'bn' ? 'বিক্রেতা হিসেবে যোগ দিন' : 'Join as a Vendor'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'bn' ? 'আপনার ব্যবসা বাড়ান এবং লাখো গ্রাহকের কাছে পৌঁছান' : 'Grow your business and reach millions of customers'}
                      </p>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleVendorAction('register')}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm"
                        >
                          {language === 'bn' ? 'বিক্রেতা রেজিস্ট্রেশন' : 'Register as Vendor'}
                        </button>
                        <button
                          onClick={() => handleVendorAction('login')}
                          className="w-full border border-orange-600 text-orange-600 hover:bg-orange-50 py-2 px-4 rounded-lg text-sm"
                        >
                          {language === 'bn' ? 'বিক্রেতা লগইন' : 'Vendor Login'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center space-x-1">
                <Globe className="h-1.5 w-1.5 text-blue-400" />
                <button
                  onClick={() => {
                    const newLanguage = language === 'en' ? 'bn' : 'en';
                    logger.info('Language changed', { from: language, to: newLanguage });
                    setLanguage(newLanguage);
                  }}
                  className="text-white/90 hover:text-blue-400 text-2xs"
                  aria-label={t('auth.change_language')}
                  role="button"
                >
                  {language === 'en' ? 'EN' : 'বাং'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Header Row */}
          <div className="flex items-center justify-between py-2">
            {/* Logo with Tagline */}
            <div className="flex items-center">
              <a href="/" className="flex flex-col cursor-pointer hover:opacity-80 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 via-yellow-500 to-orange-500 text-white rounded-md flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg">
                    G
                  </div>
                  <div className="text-lg font-bold font-inter tracking-wide">
                    GetIt
                  </div>
                </div>
                <div className="text-2xs text-purple-200 font-light -mt-1 ml-8 font-inter">
                  {language === 'bn' ? 'স্মার্ট কেনা, দ্রুত শিপিং, সহজ পেমেন্ট' : 'buy smart, ship quick, pay easy'}
                </div>
              </a>
            </div>

            {/* AI Search Bar - Made much wider */}
            <div className="flex-1 max-w-6xl mx-12">
              <AISearchBar 
                className="w-full"
                language={language}
                onSearch={(query, searchData) => {
                  // Pass all search data to CustomerLayout for Wikipedia-style inline display
                  onSearch?.(query, searchData);
                }}
                onSearchWithResults={(query, results) => {
                  // Legacy callback - still supported for backward compatibility
                  logger.debug('Legacy search callback', { query, resultsCount: results?.length });
                }}
                onSearchLoading={onSearchLoading}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart */}
              <div className="relative">
                <button 
                  className="relative p-1 hover:bg-yellow-600 rounded-lg transition-colors"
                  aria-label={language === 'bn' ? `কার্ট - ${cartCount} টি পণ্য` : `Shopping cart - ${cartCount} items`}
                  role="button"
                >
                  <ShoppingCart className="h-3 w-3" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-2xs"
                      aria-label={language === 'bn' ? `${cartCount} টি পণ্য` : `${cartCount} items`}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Dynamic Theme Switcher */}
              <div className="relative">
                <DynamicThemeSwitcher />
              </div>



              {/* Colorful Auth Icon Buttons with Hover Effects */}
              <div className="hidden md:flex space-x-1">
                <button 
                  onClick={() => navigate('/login')}
                  className="group relative p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title={language === 'bn' ? 'লগইন' : 'Login'}
                  aria-label={t('auth.login_account')}
                  role="button"
                >
                  <LogIn className="h-3 w-3 text-white group-hover:animate-pulse" aria-hidden="true" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      {language === 'bn' ? 'লগইন' : 'Login'}
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="group relative p-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title={language === 'bn' ? 'সাইনআপ' : 'Sign Up'}
                  aria-label={t('auth.create_account')}
                  role="button"
                >
                  <UserPlus className="h-3 w-3 text-white group-hover:animate-bounce" aria-hidden="true" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      {language === 'bn' ? 'সাইনআপ' : 'Sign Up'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { Header };
export default Header;