// Internationalization Configuration for Bangladesh Multi-Vendor Platform
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: 'en-US',
    currencyFormat: 'en-US'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: 'bn-BD',
    currencyFormat: 'bn-BD',
    isDefault: true // Default language for Bangladesh
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: 'hi-IN',
    currencyFormat: 'hi-IN'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: 'ar-SA',
    currencyFormat: 'ar-SA'
  }
};

export const DEFAULT_LANGUAGE = 'bn'; // Bengali as default for Bangladesh
export const FALLBACK_LANGUAGE = 'en';

// Helper functions
export const getCurrentLanguage = () => localStorage.getItem('getit-language') || DEFAULT_LANGUAGE;

export const getLanguageInfo = (code?: string) => {
  const langCode = code || getCurrentLanguage();
  return SUPPORTED_LANGUAGES[langCode as keyof typeof SUPPORTED_LANGUAGES];
};

export const isRTL = (code?: string) => {
  const lang = getLanguageInfo(code);
  return lang?.direction === 'rtl';
};

export const formatNumber = (number: number, locale?: string) => {
  const lang = getLanguageInfo(locale);
  return new Intl.NumberFormat(lang?.numberFormat || 'en-US').format(number);
};

export const formatCurrency = (amount: number, currency = 'BDT', locale?: string) => {
  const lang = getLanguageInfo(locale);
  
  try {
    return new Intl.NumberFormat(lang?.currencyFormat || 'bn-BD', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'BDT' ? 0 : 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const symbol = currency === 'BDT' ? '৳' : currency;
    return `${symbol} ${formatNumber(amount, locale)}`;
  }
};

// Bangla number conversion utilities
export const englishToBanglaNumbers = (str: string): string => {
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (match) => banglaNumbers[parseInt(match)]);
};

export const banglaToEnglishNumbers = (str: string): string => {
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (match) => banglaNumbers.indexOf(match).toString());
};

// Language switching utility
export const switchLanguage = (languageCode: string) => {
  if (SUPPORTED_LANGUAGES[languageCode as keyof typeof SUPPORTED_LANGUAGES]) {
    // Update document direction for RTL languages
    document.dir = isRTL(languageCode) ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
    
    // Store preference
    localStorage.setItem('getit-language', languageCode);
    
    // Trigger page reload to apply language changes
    window.location.reload();
    
    return true;
  }
  
  return false;
};