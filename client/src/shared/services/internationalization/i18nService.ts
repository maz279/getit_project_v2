/**
 * Internationalization Service - i18n Support
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 * Phase 1: Multi-language Support
 */

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  enabled: boolean;
}

interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

interface i18nConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: Language[];
  translations: Record<string, TranslationKeys>;
}

class InternationalizationService {
  private config: i18nConfig;
  private currentLanguage: string;

  constructor() {
    this.config = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: [
        {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          rtl: false,
          enabled: true
        },
        {
          code: 'bn',
          name: 'Bengali',
          nativeName: 'বাংলা',
          rtl: false,
          enabled: true
        },
        {
          code: 'hi',
          name: 'Hindi',
          nativeName: 'हिन्दी',
          rtl: false,
          enabled: true
        },
        {
          code: 'ur',
          name: 'Urdu',
          nativeName: 'اردو',
          rtl: true,
          enabled: true
        },
        {
          code: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          rtl: true,
          enabled: true
        }
      ],
      translations: {
        en: {
          common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            save: 'Save',
            cancel: 'Cancel',
            continue: 'Continue',
            back: 'Back',
            next: 'Next',
            previous: 'Previous',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            add: 'Add',
            edit: 'Edit',
            delete: 'Delete',
            view: 'View',
            home: 'Home',
            about: 'About',
            contact: 'Contact',
            help: 'Help',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout',
            login: 'Login',
            register: 'Register'
          },
          navigation: {
            home: 'Home',
            categories: 'Categories',
            deals: 'Deals',
            cart: 'Cart',
            account: 'Account',
            orders: 'Orders',
            wishlist: 'Wishlist',
            support: 'Support'
          },
          ecommerce: {
            addToCart: 'Add to Cart',
            buyNow: 'Buy Now',
            checkout: 'Checkout',
            price: 'Price',
            discount: 'Discount',
            shipping: 'Shipping',
            tax: 'Tax',
            total: 'Total',
            quantity: 'Quantity',
            size: 'Size',
            color: 'Color',
            brand: 'Brand',
            category: 'Category',
            reviews: 'Reviews',
            rating: 'Rating',
            inStock: 'In Stock',
            outOfStock: 'Out of Stock',
            limitedStock: 'Limited Stock'
          }
        },
        bn: {
          common: {
            loading: 'লোড হচ্ছে...',
            error: 'ত্রুটি',
            success: 'সফল',
            save: 'সংরক্ষণ',
            cancel: 'বাতিল',
            continue: 'চালিয়ে যান',
            back: 'পিছনে',
            next: 'পরবর্তী',
            previous: 'পূর্ববর্তী',
            search: 'অনুসন্ধান',
            filter: 'ফিল্টার',
            sort: 'সর্ট',
            add: 'যোগ করুন',
            edit: 'সম্পাদনা',
            delete: 'মুছুন',
            view: 'দেখুন',
            home: 'হোম',
            about: 'সম্পর্কে',
            contact: 'যোগাযোগ',
            help: 'সাহায্য',
            settings: 'সেটিংস',
            profile: 'প্রোফাইল',
            logout: 'লগআউট',
            login: 'লগইন',
            register: 'নিবন্ধন'
          },
          navigation: {
            home: 'হোম',
            categories: 'বিভাগ',
            deals: 'অফার',
            cart: 'কার্ট',
            account: 'অ্যাকাউন্ট',
            orders: 'অর্ডার',
            wishlist: 'উইশলিস্ট',
            support: 'সহায়তা'
          },
          ecommerce: {
            addToCart: 'কার্টে যোগ করুন',
            buyNow: 'এখনই কিনুন',
            checkout: 'চেকআউট',
            price: 'মূল্য',
            discount: 'ছাড়',
            shipping: 'শিপিং',
            tax: 'ট্যাক্স',
            total: 'মোট',
            quantity: 'পরিমাণ',
            size: 'সাইজ',
            color: 'রঙ',
            brand: 'ব্র্যান্ড',
            category: 'বিভাগ',
            reviews: 'রিভিউ',
            rating: 'রেটিং',
            inStock: 'স্টকে আছে',
            outOfStock: 'স্টকে নেই',
            limitedStock: 'সীমিত স্টক'
          }
        }
      }
    };
    
    this.currentLanguage = this.config.defaultLanguage;
  }

  /**
   * Get translation for a key
   */
  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let translation: any = this.config.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to default language
        translation = this.config.translations[this.config.fallbackLanguage];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }
    
    if (typeof translation === 'string') {
      // Replace parameters
      if (params) {
        Object.keys(params).forEach(param => {
          translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });
      }
      return translation;
    }
    
    return key;
  }

  /**
   * Change current language
   */
  changeLanguage(languageCode: string): void {
    const language = this.config.supportedLanguages.find(lang => lang.code === languageCode);
    if (language && language.enabled) {
      this.currentLanguage = languageCode;
      
      // Update HTML lang attribute
      document.documentElement.lang = languageCode;
      
      // Update RTL direction
      document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
      
      // Save to localStorage
      localStorage.setItem('selectedLanguage', languageCode);
      
      // Dispatch language change event
      const event = new CustomEvent('languageChanged', {
        detail: { language: languageCode }
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return this.config.supportedLanguages.filter(lang => lang.enabled);
  }

  /**
   * Initialize i18n service
   */
  initialize(): void {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      this.changeLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      const supportedLanguage = this.config.supportedLanguages.find(
        lang => lang.code === browserLanguage && lang.enabled
      );
      
      if (supportedLanguage) {
        this.changeLanguage(browserLanguage);
      }
    }
    
    // Set initial HTML attributes
    document.documentElement.lang = this.currentLanguage;
    const currentLang = this.config.supportedLanguages.find(lang => lang.code === this.currentLanguage);
    if (currentLang) {
      document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
    }
  }

  /**
   * Get RTL status for current language
   */
  isRTL(): boolean {
    const currentLang = this.config.supportedLanguages.find(lang => lang.code === this.currentLanguage);
    return currentLang?.rtl || false;
  }

  /**
   * Format currency based on language
   */
  formatCurrency(amount: number, currency: string = 'BDT'): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      en: new Intl.NumberFormat('en-US', { style: 'currency', currency }),
      bn: new Intl.NumberFormat('bn-BD', { style: 'currency', currency }),
      hi: new Intl.NumberFormat('hi-IN', { style: 'currency', currency }),
      ur: new Intl.NumberFormat('ur-PK', { style: 'currency', currency }),
      ar: new Intl.NumberFormat('ar-SA', { style: 'currency', currency })
    };
    
    const formatter = formatters[this.currentLanguage] || formatters.en;
    return formatter.format(amount);
  }

  /**
   * Format date based on language
   */
  formatDate(date: Date): string {
    const formatters: Record<string, Intl.DateTimeFormat> = {
      en: new Intl.DateTimeFormat('en-US'),
      bn: new Intl.DateTimeFormat('bn-BD'),
      hi: new Intl.DateTimeFormat('hi-IN'),
      ur: new Intl.DateTimeFormat('ur-PK'),
      ar: new Intl.DateTimeFormat('ar-SA')
    };
    
    const formatter = formatters[this.currentLanguage] || formatters.en;
    return formatter.format(date);
  }
}

export default new InternationalizationService();
export type { Language, TranslationKeys, i18nConfig };