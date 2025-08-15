import React, { createContext, useContext, useReducer, useEffect } from 'react';

// LanguageContext - Global Language Context for GetIt Bangladesh
// Amazon.com/Shopee.sg-Level Multi-Language State Management

const LanguageContext = createContext(null);

// Language Action Types
const LANGUAGE_ACTIONS = {
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_FALLBACK_LANGUAGE: 'SET_FALLBACK_LANGUAGE',
  LOAD_TRANSLATIONS: 'LOAD_TRANSLATIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Supported languages for Bangladesh market
export const LANGUAGES = {
  BENGALI: 'bn',
  ENGLISH: 'en',
  HINDI: 'hi',
  ARABIC: 'ar'
};

// Language configurations
const LANGUAGE_CONFIG = {
  [LANGUAGES.BENGALI]: {
    name: 'বাংলা',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    direction: 'ltr',
    region: 'BD',
    flag: '🇧🇩',
    primary: true, // Primary language for Bangladesh
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'bn-BD',
    currency: 'BDT'
  },
  [LANGUAGES.ENGLISH]: {
    name: 'English',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
    region: 'US',
    flag: '🇺🇸',
    primary: true, // Secondary primary for international users
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    currency: 'USD'
  },
  [LANGUAGES.HINDI]: {
    name: 'हिन्दी',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    direction: 'ltr',
    region: 'IN',
    flag: '🇮🇳',
    primary: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'hi-IN',
    currency: 'INR'
  },
  [LANGUAGES.ARABIC]: {
    name: 'العربية',
    nativeName: 'العربية',
    englishName: 'Arabic',
    direction: 'rtl',
    region: 'SA',
    flag: '🇸🇦',
    primary: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
    currency: 'SAR'
  }
};

// Default translations - these would typically be loaded from translation files
const DEFAULT_TRANSLATIONS = {
  [LANGUAGES.BENGALI]: {
    // Navigation
    'nav.home': 'হোম',
    'nav.products': 'পণ্য',
    'nav.categories': 'বিভাগ',
    'nav.cart': 'কার্ট',
    'nav.orders': 'অর্ডার',
    'nav.account': 'অ্যাকাউন্ট',
    
    // Common actions
    'action.add_to_cart': 'কার্টে যোগ করুন',
    'action.buy_now': 'এখনই কিনুন',
    'action.search': 'খুঁজুন',
    'action.filter': 'ফিল্টার',
    'action.sort': 'সাজান',
    'action.login': 'লগইন',
    'action.register': 'নিবন্ধন',
    'action.logout': 'লগআউট',
    
    // Product
    'product.price': 'দাম',
    'product.discount': 'ছাড়',
    'product.rating': 'রেটিং',
    'product.reviews': 'রিভিউ',
    'product.availability': 'স্টক',
    'product.in_stock': 'স্টকে আছে',
    'product.out_of_stock': 'স্টকে নেই',
    
    // Cart & Checkout
    'cart.title': 'শপিং কার্ট',
    'cart.total': 'মোট',
    'cart.subtotal': 'উপমোট',
    'cart.shipping': 'ডেলিভারি চার্জ',
    'cart.tax': 'ভ্যাট',
    'checkout.title': 'চেকআউট',
    'checkout.shipping_address': 'ডেলিভারি ঠিকানা',
    'checkout.payment_method': 'পেমেন্ট পদ্ধতি',
    
    // Payment methods
    'payment.bkash': 'বিকাশ',
    'payment.nagad': 'নগদ',
    'payment.rocket': 'রকেট',
    'payment.cash_on_delivery': 'ক্যাশ অন ডেলিভারি',
    'payment.card': 'কার্ড',
    
    // Status
    'status.loading': 'লোড হচ্ছে...',
    'status.error': 'ত্রুটি',
    'status.success': 'সফল',
    'status.pending': 'অপেক্ষমাণ',
    'status.processing': 'প্রক্রিয়াধীন',
    'status.completed': 'সম্পন্ন',
    
    // Cultural greetings
    'greeting.assalamu_alaikum': 'আসসালামু আলাইকুম',
    'greeting.namaskar': 'নমস্কার',
    'greeting.adab': 'আদাব',
    'greeting.welcome': 'স্বাগতম'
  },
  
  [LANGUAGES.ENGLISH]: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.account': 'Account',
    
    // Common actions
    'action.add_to_cart': 'Add to Cart',
    'action.buy_now': 'Buy Now',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.sort': 'Sort',
    'action.login': 'Login',
    'action.register': 'Register',
    'action.logout': 'Logout',
    
    // Product
    'product.price': 'Price',
    'product.discount': 'Discount',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.availability': 'Availability',
    'product.in_stock': 'In Stock',
    'product.out_of_stock': 'Out of Stock',
    
    // Cart & Checkout
    'cart.title': 'Shopping Cart',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'checkout.title': 'Checkout',
    'checkout.shipping_address': 'Shipping Address',
    'checkout.payment_method': 'Payment Method',
    
    // Payment methods
    'payment.bkash': 'bKash',
    'payment.nagad': 'Nagad',
    'payment.rocket': 'Rocket',
    'payment.cash_on_delivery': 'Cash on Delivery',
    'payment.card': 'Card Payment',
    
    // Status
    'status.loading': 'Loading...',
    'status.error': 'Error',
    'status.success': 'Success',
    'status.pending': 'Pending',
    'status.processing': 'Processing',
    'status.completed': 'Completed',
    
    // Cultural greetings
    'greeting.assalamu_alaikum': 'Peace be upon you',
    'greeting.namaskar': 'Namaskar',
    'greeting.adab': 'Adab',
    'greeting.welcome': 'Welcome'
  }
};

// Initial Language State
const initialState = {
  currentLanguage: LANGUAGES.BENGALI, // Default to Bengali for Bangladesh market
  fallbackLanguage: LANGUAGES.ENGLISH,
  direction: 'ltr',
  translations: {},
  isLoading: false,
  error: null,
  detectedLanguage: null
};

// Language Reducer
function languageReducer(state, action) {
  switch (action.type) {
    case LANGUAGE_ACTIONS.SET_LANGUAGE: {
      const config = LANGUAGE_CONFIG[action.payload];
      return {
        ...state,
        currentLanguage: action.payload,
        direction: config?.direction || 'ltr',
        isLoading: false,
        error: null
      };
    }

    case LANGUAGE_ACTIONS.SET_DIRECTION:
      return {
        ...state,
        direction: action.payload
      };

    case LANGUAGE_ACTIONS.SET_FALLBACK_LANGUAGE:
      return {
        ...state,
        fallbackLanguage: action.payload
      };

    case LANGUAGE_ACTIONS.LOAD_TRANSLATIONS:
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.language]: action.payload.translations
        },
        isLoading: false,
        error: null
      };

    case LANGUAGE_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case LANGUAGE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case LANGUAGE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Language detection utility
function detectUserLanguage() {
  // Try to detect from browser language
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Map browser language codes to our supported languages
  if (browserLang.startsWith('bn')) return LANGUAGES.BENGALI;
  if (browserLang.startsWith('hi')) return LANGUAGES.HINDI;
  if (browserLang.startsWith('ar')) return LANGUAGES.ARABIC;
  if (browserLang.startsWith('en')) return LANGUAGES.ENGLISH;
  
  // Default to Bengali for Bangladesh market
  return LANGUAGES.BENGALI;
}

// LanguageProvider Component
export function LanguageProvider({ children }) {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  // Initialize language on mount
  useEffect(() => {
    try {
      // Try to get saved language preference
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage && LANGUAGE_CONFIG[savedLanguage]) {
        dispatch({ type: LANGUAGE_ACTIONS.SET_LANGUAGE, payload: savedLanguage });
      } else {
        // Detect user's preferred language
        const detectedLanguage = detectUserLanguage();
        dispatch({ type: LANGUAGE_ACTIONS.SET_LANGUAGE, payload: detectedLanguage });
      }

      // Load default translations
      Object.entries(DEFAULT_TRANSLATIONS).forEach(([lang, translations]) => {
        dispatch({
          type: LANGUAGE_ACTIONS.LOAD_TRANSLATIONS,
          payload: { language: lang, translations }
        });
      });

    } catch (error) {
      console.error('Error initializing language:', error);
      dispatch({ type: LANGUAGE_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Apply language changes to document
  useEffect(() => {
    const config = LANGUAGE_CONFIG[state.currentLanguage];
    if (config) {
      // Update document language and direction
      document.documentElement.lang = state.currentLanguage;
      document.documentElement.dir = config.direction;
      
      // Update body class for language-specific styling
      document.body.className = document.body.className.replace(/\blang-\w+\b/g, '');
      document.body.classList.add(`lang-${state.currentLanguage}`);
      
      // Update direction class
      document.body.className = document.body.className.replace(/\bdir-\w+\b/g, '');
      document.body.classList.add(`dir-${config.direction}`);
    }
  }, [state.currentLanguage]);

  // Save language preference
  useEffect(() => {
    try {
      localStorage.setItem('preferred_language', state.currentLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [state.currentLanguage]);

  // Set language
  const setLanguage = async (languageCode) => {
    if (!LANGUAGE_CONFIG[languageCode]) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    dispatch({ type: LANGUAGE_ACTIONS.SET_LOADING, payload: true });

    try {
      // If translations not loaded, load them
      if (!state.translations[languageCode]) {
        // In real app, this would load from translation files or API
        const translations = DEFAULT_TRANSLATIONS[languageCode] || {};
        dispatch({
          type: LANGUAGE_ACTIONS.LOAD_TRANSLATIONS,
          payload: { language: languageCode, translations }
        });
      }

      dispatch({ type: LANGUAGE_ACTIONS.SET_LANGUAGE, payload: languageCode });
    } catch (error) {
      dispatch({ type: LANGUAGE_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Get translation
  const translate = (key, params = {}) => {
    const currentTranslations = state.translations[state.currentLanguage] || {};
    const fallbackTranslations = state.translations[state.fallbackLanguage] || {};
    
    let translation = currentTranslations[key] || fallbackTranslations[key] || key;
    
    // Replace parameters in translation
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{{${param}}}`, value);
    });
    
    return translation;
  };

  // Short alias for translate
  const t = translate;

  // Format number according to current language
  const formatNumber = (number, options = {}) => {
    const config = LANGUAGE_CONFIG[state.currentLanguage];
    const locale = config?.numberFormat || 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      return number.toString();
    }
  };

  // Format currency
  const formatCurrency = (amount, currencyCode = null) => {
    const config = LANGUAGE_CONFIG[state.currentLanguage];
    const currency = currencyCode || config?.currency || 'BDT';
    const locale = config?.numberFormat || 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  };

  // Format date according to current language
  const formatDate = (date, options = {}) => {
    const config = LANGUAGE_CONFIG[state.currentLanguage];
    const locale = config?.numberFormat || 'en-US';
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    } catch (error) {
      return date.toString();
    }
  };

  // Get current language configuration
  const getCurrentLanguageConfig = () => {
    return LANGUAGE_CONFIG[state.currentLanguage];
  };

  // Check if current language is RTL
  const isRTL = () => {
    const config = LANGUAGE_CONFIG[state.currentLanguage];
    return config?.direction === 'rtl';
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
      code,
      ...config
    }));
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: LANGUAGE_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    currentLanguage: state.currentLanguage,
    fallbackLanguage: state.fallbackLanguage,
    direction: state.direction,
    isLoading: state.isLoading,
    error: state.error,
    
    // Configuration
    languageConfig: getCurrentLanguageConfig(),
    availableLanguages: getAvailableLanguages(),
    
    // Actions
    setLanguage,
    clearError,
    
    // Translation functions
    translate,
    t, // Short alias
    
    // Formatting functions
    formatNumber,
    formatCurrency,
    formatDate,
    
    // Utility functions
    isRTL,
    getCurrentLanguageConfig,
    
    // Constants
    languages: LANGUAGES,
    languageConfigs: LANGUAGE_CONFIG
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguageContext() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  
  return context;
}

// Alternative hook name for compatibility
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// Convenience hook for translations
export function useTranslation() {
  const { translate, t } = useLanguageContext();
  return { translate, t };
}

export default LanguageContext;