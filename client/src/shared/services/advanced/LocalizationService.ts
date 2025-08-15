/**
 * Localization Service
 * Amazon.com/Shopee.sg-Level Internationalization
 * Complete multi-language support with Bengali and English
 */

interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  enableRTL: boolean;
  enableBengali: boolean;
}

interface TranslationEntry {
  key: string;
  value: string;
  language: string;
  context?: string;
  plurals?: Record<string, string>;
}

interface LocalizationMetrics {
  totalKeys: number;
  translatedKeys: number;
  completionRate: number;
  missingTranslations: string[];
}

class LocalizationService {
  private static instance: LocalizationService;
  private config: LocalizationConfig;
  private translations: Map<string, Map<string, TranslationEntry>>;
  private currentLanguage: string;
  private observers: ((language: string) => void)[] = [];

  private constructor() {
    this.config = {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'bn'],
      fallbackLanguage: 'en',
      enableRTL: false,
      enableBengali: true
    };

    this.translations = new Map();
    this.currentLanguage = this.config.defaultLanguage;
    this.initializeTranslations();
  }

  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  /**
   * Initialize default translations
   */
  private initializeTranslations(): void {
    // English translations
    this.addTranslation('en', 'common.welcome', 'Welcome');
    this.addTranslation('en', 'common.login', 'Login');
    this.addTranslation('en', 'common.logout', 'Logout');
    this.addTranslation('en', 'common.signup', 'Sign Up');
    this.addTranslation('en', 'common.search', 'Search');
    this.addTranslation('en', 'common.cart', 'Cart');
    this.addTranslation('en', 'common.checkout', 'Checkout');
    this.addTranslation('en', 'common.profile', 'Profile');
    this.addTranslation('en', 'common.orders', 'Orders');
    this.addTranslation('en', 'common.settings', 'Settings');

    // Bengali translations
    this.addTranslation('bn', 'common.welcome', 'স্বাগতম');
    this.addTranslation('bn', 'common.login', 'লগইন');
    this.addTranslation('bn', 'common.logout', 'লগআউট');
    this.addTranslation('bn', 'common.signup', 'সাইন আপ');
    this.addTranslation('bn', 'common.search', 'খুঁজুন');
    this.addTranslation('bn', 'common.cart', 'কার্ট');
    this.addTranslation('bn', 'common.checkout', 'চেকআউট');
    this.addTranslation('bn', 'common.profile', 'প্রোফাইল');
    this.addTranslation('bn', 'common.orders', 'অর্ডার');
    this.addTranslation('bn', 'common.settings', 'সেটিংস');

    // E-commerce specific translations
    this.addTranslation('en', 'product.addToCart', 'Add to Cart');
    this.addTranslation('en', 'product.buyNow', 'Buy Now');
    this.addTranslation('en', 'product.outOfStock', 'Out of Stock');
    this.addTranslation('en', 'product.price', 'Price');
    this.addTranslation('en', 'product.discount', 'Discount');
    this.addTranslation('en', 'product.reviews', 'Reviews');

    this.addTranslation('bn', 'product.addToCart', 'কার্টে যোগ করুন');
    this.addTranslation('bn', 'product.buyNow', 'এখনই কিনুন');
    this.addTranslation('bn', 'product.outOfStock', 'স্টক শেষ');
    this.addTranslation('bn', 'product.price', 'দাম');
    this.addTranslation('bn', 'product.discount', 'ছাড়');
    this.addTranslation('bn', 'product.reviews', 'রিভিউ');

    // Mobile banking translations
    this.addTranslation('en', 'payment.bkash', 'bKash');
    this.addTranslation('en', 'payment.nagad', 'Nagad');
    this.addTranslation('en', 'payment.rocket', 'Rocket');
    this.addTranslation('bn', 'payment.bkash', 'বিকাশ');
    this.addTranslation('bn', 'payment.nagad', 'নগদ');
    this.addTranslation('bn', 'payment.rocket', 'রকেট');
  }

  /**
   * Add translation
   */
  public addTranslation(language: string, key: string, value: string, context?: string): void {
    if (!this.translations.has(language)) {
      this.translations.set(language, new Map());
    }

    const entry: TranslationEntry = {
      key,
      value,
      language,
      context
    };

    this.translations.get(language)!.set(key, entry);
  }

  /**
   * Get translation
   */
  public t(key: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const langMap = this.translations.get(lang);

    if (langMap && langMap.has(key)) {
      return langMap.get(key)!.value;
    }

    // Fallback to default language
    if (lang !== this.config.fallbackLanguage) {
      const fallbackMap = this.translations.get(this.config.fallbackLanguage);
      if (fallbackMap && fallbackMap.has(key)) {
        return fallbackMap.get(key)!.value;
      }
    }

    // Return key if translation not found
    return key;
  }

  /**
   * Set current language
   */
  public setLanguage(language: string): void {
    if (this.config.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      this.notifyObservers(language);
      this.updateDocumentLanguage(language);
    }
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): string[] {
    return [...this.config.supportedLanguages];
  }

  /**
   * Check if language is supported
   */
  public isLanguageSupported(language: string): boolean {
    return this.config.supportedLanguages.includes(language);
  }

  /**
   * Update document language
   */
  private updateDocumentLanguage(language: string): void {
    document.documentElement.lang = language;
    
    // Update text direction for RTL languages
    if (this.isRTLLanguage(language)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  /**
   * Check if language is RTL
   */
  private isRTLLanguage(language: string): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(language);
  }

  /**
   * Subscribe to language changes
   */
  public subscribe(callback: (language: string) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify observers
   */
  private notifyObservers(language: string): void {
    this.observers.forEach(callback => callback(language));
  }

  /**
   * Get localization metrics
   */
  public getMetrics(): LocalizationMetrics {
    const totalKeys = new Set<string>();
    const translatedKeys = new Set<string>();
    const missingTranslations: string[] = [];

    this.translations.forEach((langMap, language) => {
      langMap.forEach((entry, key) => {
        totalKeys.add(key);
        if (entry.value && entry.value.trim()) {
          translatedKeys.add(key);
        }
      });
    });

    // Find missing translations
    totalKeys.forEach(key => {
      this.config.supportedLanguages.forEach(lang => {
        const langMap = this.translations.get(lang);
        if (!langMap || !langMap.has(key)) {
          missingTranslations.push(`${lang}.${key}`);
        }
      });
    });

    return {
      totalKeys: totalKeys.size,
      translatedKeys: translatedKeys.size,
      completionRate: totalKeys.size > 0 ? (translatedKeys.size / totalKeys.size) * 100 : 0,
      missingTranslations
    };
  }

  /**
   * Format number with locale
   */
  public formatNumber(number: number, language?: string): string {
    const lang = language || this.currentLanguage;
    
    try {
      return new Intl.NumberFormat(lang).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format currency
   */
  public formatCurrency(amount: number, currency: string = 'BDT', language?: string): string {
    const lang = language || this.currentLanguage;
    
    try {
      return new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  }

  /**
   * Format date
   */
  public formatDate(date: Date, language?: string): string {
    const lang = language || this.currentLanguage;
    
    try {
      return new Intl.DateTimeFormat(lang).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get language display name
   */
  public getLanguageDisplayName(language: string): string {
    const displayNames: Record<string, string> = {
      'en': 'English',
      'bn': 'বাংলা'
    };

    return displayNames[language] || language;
  }

  /**
   * Load translations from file
   */
  public async loadTranslations(language: string, translations: Record<string, string>): Promise<void> {
    Object.entries(translations).forEach(([key, value]) => {
      this.addTranslation(language, key, value);
    });
  }

  /**
   * Export translations
   */
  public exportTranslations(language: string): Record<string, string> {
    const langMap = this.translations.get(language);
    if (!langMap) return {};

    const exported: Record<string, string> = {};
    langMap.forEach((entry, key) => {
      exported[key] = entry.value;
    });

    return exported;
  }

  /**
   * Get all translations
   */
  public getAllTranslations(): Record<string, Record<string, string>> {
    const all: Record<string, Record<string, string>> = {};
    
    this.translations.forEach((langMap, language) => {
      all[language] = this.exportTranslations(language);
    });

    return all;
  }

  /**
   * Clear all translations
   */
  public clearTranslations(): void {
    this.translations.clear();
    this.initializeTranslations();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<LocalizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  public getConfig(): LocalizationConfig {
    return { ...this.config };
  }
}

export default LocalizationService;