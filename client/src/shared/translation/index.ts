// Translation system implementation
interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

const translations: Translations = {
  'support.24_7': {
    en: '24/7 Support',
    bn: '২৪/৭ সাপোর্ট'
  },
  'delivery.deliver_to': {
    en: 'Deliver to',
    bn: 'পৌঁছানো'
  },
  'delivery.free_above_500': {
    en: 'Free Delivery ৳500+',
    bn: 'ফ্রি ডেলিভারি ৳৫০০+'
  },
  'location.select_delivery_area': {
    en: 'Select Delivery Area',
    bn: 'ডেলিভারি এলাকা নির্বাচন করুন'
  },
  'location.select_area_description': {
    en: 'Choose your area for faster delivery and accurate pricing',
    bn: 'আপনার এলাকা নির্বাচন করুন দ্রুত ডেলিভারি ও সঠিক মূল্যের জন্য'
  },
  'location.search_placeholder': {
    en: 'Search for city or area...',
    bn: 'শহর বা এলাকা খুঁজুন...'
  },
  'location.search_results': {
    en: 'Search Results',
    bn: 'অনুসন্ধান ফলাফল'
  },
  'location.popular_areas': {
    en: 'Popular Areas',
    bn: 'জনপ্রিয় এলাকা'
  },
  'location.all_districts': {
    en: 'All Districts (64)',
    bn: 'সকল জেলা (৬ৄটি)'
  },
  'premium.title': {
    en: 'Premium',
    bn: 'প্রিমিয়াম'
  },
  'vendor.become_vendor': {
    en: 'Become a Vendor',
    bn: 'বিক্রেতা হন'
  },
  'vendor.join_as_vendor': {
    en: 'Join as a Vendor',
    bn: 'বিক্রেতা হিসেবে যোগ দিন'
  },
  'vendor.grow_business': {
    en: 'Grow your business and reach millions of customers',
    bn: 'আপনার ব্যবসা বাড়ান এবং লাখো গ্রাহকের কাছে পৌঁছান'
  },
  'vendor.register': {
    en: 'Register as Vendor',
    bn: 'বিক্রেতা রেজিস্ট্রেশন'
  },
  'vendor.login': {
    en: 'Vendor Login',
    bn: 'বিক্রেতা লগইন'
  },
  'auth.login': {
    en: 'Login',
    bn: 'লগইন'
  },
  'auth.signup': {
    en: 'Sign Up',
    bn: 'সাইনআপ'
  },
  'auth.login_account': {
    en: 'Login to your account',
    bn: 'লগইন করুন'
  },
  'auth.create_account': {
    en: 'Create new account',
    bn: 'নতুন অ্যাকাউন্ট তৈরি করুন'
  },
  'auth.change_language': {
    en: 'Change language',
    bn: 'ভাষা পরিবর্তন করুন'
  },
  'navigation.main': {
    en: 'Main navigation',
    bn: 'মূল নেভিগেশন'
  },
  'categories.electronics': {
    en: 'Electronics',
    bn: 'ইলেকট্রনিক্স'
  },
  'categories.fashion': {
    en: 'Fashion',
    bn: 'ফ্যাশন'
  },
  'categories.home': {
    en: 'Home & Living',
    bn: 'ঘর ও জীবন'
  },
  'categories.beauty': {
    en: 'Beauty',
    bn: 'সৌন্দর্য'
  },
  'categories.sports': {
    en: 'Sports',
    bn: 'খেলাধুলা'
  },
  'categories.books': {
    en: 'Books',
    bn: 'বই'
  },
  'categories.automotive': {
    en: 'Automotive',
    bn: 'গাড়ি'
  },
  'categories.grocery': {
    en: 'Grocery',
    bn: 'মুদিখানা'
  },
  'tagline': {
    en: 'buy smart, ship quick, pay easy',
    bn: 'স্মার্ট কেনা, দ্রুত শিপিং, সহজ পেমেন্ট'
  }
};

// Enhanced translation hook
export const useTranslation = () => {
  const { language } = useSimpleLanguage();
  
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      // Use structured logging instead of console.warn
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Translation missing', { key });
      }
      return key;
    }
    return translation[language] || translation.en;
  };
  
  return { t };
};

// Logger implementation for Phase 1
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  environment: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private createLogEntry(level: keyof LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    };
  }
  
  private log(entry: LogEntry) {
    if (this.isDevelopment) {
      const logMethod = console[entry.level] || console.log;
      logMethod(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.data || '');
    }
    
    // In production, send to logging service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: Send to external logging service
      // fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    }
  }
  
  error(message: string, data?: any) {
    this.log(this.createLogEntry('ERROR', message, data));
  }
  
  warn(message: string, data?: any) {
    this.log(this.createLogEntry('WARN', message, data));
  }
  
  info(message: string, data?: any) {
    this.log(this.createLogEntry('INFO', message, data));
  }
  
  debug(message: string, data?: any) {
    this.log(this.createLogEntry('DEBUG', message, data));
  }
}

export const logger = new Logger();

// Import useSimpleLanguage
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';