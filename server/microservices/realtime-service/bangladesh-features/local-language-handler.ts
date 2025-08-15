/**
 * Local Language Handler
 * Amazon.com/Shopee.sg-Level Bengali real-time message support
 */

export class LocalLanguageHandler {
  private translations: Map<string, { en: string; bn: string }> = new Map();

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    // Real-time message templates
    const messageTemplates = [
      { key: 'price_drop', en: 'Price dropped by {percentage}%!', bn: 'দাম {percentage}% কমেছে!' },
      { key: 'order_confirmed', en: 'Your order has been confirmed', bn: 'আপনার অর্ডার নিশ্চিত হয়েছে' },
      { key: 'payment_success', en: 'Payment successful', bn: 'পেমেন্ট সফল হয়েছে' },
      { key: 'payment_failed', en: 'Payment failed', bn: 'পেমেন্ট ব্যর্থ হয়েছে' },
      { key: 'order_shipped', en: 'Your order has been shipped', bn: 'আপনার অর্ডার পাঠানো হয়েছে' },
      { key: 'order_delivered', en: 'Your order has been delivered', bn: 'আপনার অর্ডার ডেলিভার হয়েছে' },
      { key: 'stock_available', en: 'Back in stock!', bn: 'আবার স্টকে আছে!' },
      { key: 'flash_sale_start', en: 'Flash sale started!', bn: 'ফ্ল্যাশ সেল শুরু!' },
      { key: 'bkash_payment', en: 'bKash payment pending', bn: 'বিকাশ পেমেন্ট অপেক্ষমাণ' },
      { key: 'nagad_payment', en: 'Nagad payment pending', bn: 'নগদ পেমেন্ট অপেক্ষমাণ' },
      { key: 'rocket_payment', en: 'Rocket payment pending', bn: 'রকেট পেমেন্ট অপেক্ষমাণ' },
      { key: 'cod_selected', en: 'Cash on delivery selected', bn: 'ক্যাশ অন ডেলিভারি নির্বাচিত' },
      { key: 'user_online', en: 'User is online', bn: 'ইউজার অনলাইনে আছে' },
      { key: 'user_typing', en: 'User is typing...', bn: 'ইউজার টাইপ করছে...' },
      { key: 'new_message', en: 'New message received', bn: 'নতুন মেসেজ পেয়েছেন' },
      { key: 'support_agent_joined', en: 'Support agent joined', bn: 'সাপোর্ট এজেন্ট যোগ দিয়েছে' },
      { key: 'chat_started', en: 'Chat started', bn: 'চ্যাট শুরু হয়েছে' },
      { key: 'cart_updated', en: 'Cart updated', bn: 'কার্ট আপডেট হয়েছে' },
      { key: 'wishlist_added', en: 'Added to wishlist', bn: 'উইশলিস্টে যোগ করা হয়েছে' },
      { key: 'promotion_alert', en: 'Special promotion available!', bn: 'বিশেষ প্রমোশন পাওয়া যাচ্ছে!' },
      
      // Bangladesh festival messages
      { key: 'eid_greeting', en: 'Eid Mubarak! Special offers available', bn: 'ঈদ মুবারক! বিশেষ অফার পাওয়া যাচ্ছে' },
      { key: 'pohela_boishakh', en: 'Happy Pohela Boishakh!', bn: 'শুভ পহেলা বৈশাখ!' },
      { key: 'victory_day', en: 'Happy Victory Day!', bn: 'শুভ বিজয় দিবস!' },
      { key: 'independence_day', en: 'Happy Independence Day!', bn: 'শুভ স্বাধীনতা দিবস!' },
      { key: 'durga_puja', en: 'Happy Durga Puja!', bn: 'শুভ দুর্গা পূজা!' },
      
      // Prayer time related
      { key: 'fajr_time', en: 'Fajr prayer time', bn: 'ফজরের নামাজের সময়' },
      { key: 'maghrib_time', en: 'Maghrib prayer time', bn: 'মাগরিবের নামাজের সময়' },
      { key: 'jummah_reminder', en: 'Jummah prayer reminder', bn: 'জুমার নামাজের স্মরণিকা' },
      
      // Shipping and logistics
      { key: 'pathao_pickup', en: 'Pathao pickup scheduled', bn: 'পাঠাও পিকআপ নির্ধারিত' },
      { key: 'paperfly_delivery', en: 'Paperfly delivery in progress', bn: 'পেপারফ্লাই ডেলিভারি চলমান' },
      { key: 'same_day_delivery', en: 'Same day delivery available', bn: 'একই দিনে ডেলিভারি পাওয়া যাচ্ছে' },
      
      // Network and connectivity
      { key: 'slow_connection', en: 'Optimizing for slow connection', bn: 'ধীর সংযোগের জন্য অপ্টিমাইজ করা হচ্ছে' },
      { key: 'offline_mode', en: 'Working in offline mode', bn: 'অফলাইন মোডে কাজ করছে' },
      { key: 'connection_restored', en: 'Connection restored', bn: 'সংযোগ পুনরুদ্ধার হয়েছে' }
    ];

    messageTemplates.forEach(template => {
      this.translations.set(template.key, {
        en: template.en,
        bn: template.bn
      });
    });
  }

  /**
   * Translate message to Bengali
   */
  translateMessage(key: string, language: 'en' | 'bn' = 'en', variables?: Record<string, any>): string {
    const translation = this.translations.get(key);
    
    if (!translation) {
      return key; // Return key if no translation found
    }

    let message = translation[language] || translation.en;

    // Replace variables if provided
    if (variables) {
      Object.keys(variables).forEach(variable => {
        const placeholder = `{${variable}}`;
        message = message.replace(new RegExp(placeholder, 'g'), variables[variable]);
      });
    }

    return message;
  }

  /**
   * Get both English and Bengali versions
   */
  getBilingualMessage(key: string, variables?: Record<string, any>): { en: string; bn: string } {
    return {
      en: this.translateMessage(key, 'en', variables),
      bn: this.translateMessage(key, 'bn', variables)
    };
  }

  /**
   * Format real-time notification with Bengali support
   */
  formatRealtimeNotification(data: {
    type: string;
    title_key?: string;
    message_key?: string;
    variables?: Record<string, any>;
    user_language?: 'en' | 'bn';
  }): {
    title: string;
    title_bn: string;
    message: string;
    message_bn: string;
  } {
    const { type, title_key, message_key, variables, user_language = 'en' } = data;

    // Use type as fallback for keys
    const titleKey = title_key || type;
    const messageKey = message_key || type;

    const titleTranslation = this.getBilingualMessage(titleKey, variables);
    const messageTranslation = this.getBilingualMessage(messageKey, variables);

    return {
      title: titleTranslation.en,
      title_bn: titleTranslation.bn,
      message: messageTranslation.en,
      message_bn: messageTranslation.bn
    };
  }

  /**
   * Format presence status in Bengali
   */
  formatPresenceStatus(status: string, language: 'en' | 'bn' = 'en'): string {
    const statusTranslations: Record<string, { en: string; bn: string }> = {
      online: { en: 'Online', bn: 'অনলাইন' },
      away: { en: 'Away', bn: 'দূরে' },
      busy: { en: 'Busy', bn: 'ব্যস্ত' },
      offline: { en: 'Offline', bn: 'অফলাইন' }
    };

    const translation = statusTranslations[status];
    return translation ? translation[language] : status;
  }

  /**
   * Format chat message with auto-translation
   */
  formatChatMessage(data: {
    message: string;
    sender_language?: 'en' | 'bn';
    recipient_language?: 'en' | 'bn';
    auto_translate?: boolean;
  }): {
    message: string;
    message_bn?: string;
    auto_translated?: boolean;
  } {
    const { message, sender_language = 'en', recipient_language = 'en', auto_translate = true } = data;

    // If languages match or auto-translate is disabled, return original
    if (sender_language === recipient_language || !auto_translate) {
      return { message };
    }

    // Simple translation for common phrases
    const commonPhrases: Record<string, string> = {
      'hello': 'হ্যালো',
      'hi': 'হাই',
      'thanks': 'ধন্যবাদ',
      'thank you': 'ধন্যবাদ',
      'welcome': 'স্বাগতম',
      'please': 'দয়া করে',
      'help': 'সাহায্য',
      'order': 'অর্ডার',
      'delivery': 'ডেলিভারি',
      'payment': 'পেমেন্ট',
      'price': 'দাম',
      'product': 'পণ্য',
      'service': 'সেবা',
      'problem': 'সমস্যা',
      'support': 'সাপোর্ট',
      'urgent': 'জরুরি',
      'quickly': 'দ্রুত',
      'when': 'কখন',
      'where': 'কোথায়',
      'how': 'কিভাবে',
      'what': 'কি',
      'why': 'কেন',
      'yes': 'হ্যাঁ',
      'no': 'না',
      'ok': 'ঠিক আছে',
      'good': 'ভাল',
      'bad': 'খারাপ'
    };

    let translatedMessage = message.toLowerCase();
    let hasTranslation = false;

    // Apply common phrase translations
    Object.keys(commonPhrases).forEach(englishPhrase => {
      if (translatedMessage.includes(englishPhrase)) {
        translatedMessage = translatedMessage.replace(
          new RegExp(englishPhrase, 'gi'),
          commonPhrases[englishPhrase]
        );
        hasTranslation = true;
      }
    });

    return {
      message,
      message_bn: hasTranslation ? translatedMessage : undefined,
      auto_translated: hasTranslation
    };
  }

  /**
   * Get time in Bengali format
   */
  formatBengaliTime(date: Date = new Date()): string {
    const bengaliNumerals = ['০', '১', '২', '৩', 'ৄ', '৫', '৬', '৭', '৮', '৯'];
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Convert to 12-hour format
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    
    // Convert numbers to Bengali numerals
    const bengaliHour = hour12.toString().split('').map(digit => bengaliNumerals[parseInt(digit)]).join('');
    const bengaliMinute = minutes.toString().padStart(2, '0').split('').map(digit => bengaliNumerals[parseInt(digit)]).join('');
    
    return `${bengaliHour}:${bengaliMinute} ${ampm}`;
  }

  /**
   * Format Bangladesh currency
   */
  formatBengaliCurrency(amount: number): string {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    
    // Format number with commas
    const formattedAmount = amount.toLocaleString('en-BD');
    
    // Convert to Bengali numerals
    const bengaliAmount = formattedAmount.split('').map(char => {
      const digit = parseInt(char);
      return isNaN(digit) ? char : bengaliNumerals[digit];
    }).join('');
    
    return `৳${bengaliAmount}`;
  }

  /**
   * Get cultural greeting based on time and festivals
   */
  getCulturalGreeting(language: 'en' | 'bn' = 'en'): string {
    const now = new Date();
    const hour = now.getHours();
    
    // Check for special dates (simplified)
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // Eid approximation (changes yearly)
    if ((month === 4 && day >= 20) || (month === 5 && day <= 5)) {
      return language === 'bn' ? 'ঈদ মুবারক!' : 'Eid Mubarak!';
    }
    
    // Pohela Boishakh (April 14)
    if (month === 4 && day === 14) {
      return language === 'bn' ? 'শুভ নববর্ষ!' : 'Happy New Year!';
    }
    
    // Regular time-based greetings
    if (hour >= 5 && hour < 12) {
      return language === 'bn' ? 'সুপ্রভাত' : 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return language === 'bn' ? 'শুভ অপরাহ্ন' : 'Good afternoon';
    } else if (hour >= 17 && hour < 20) {
      return language === 'bn' ? 'শুভ সন্ধ্যা' : 'Good evening';
    } else {
      return language === 'bn' ? 'শুভ রাত্রি' : 'Good night';
    }
  }

  /**
   * Add new translation
   */
  addTranslation(key: string, en: string, bn: string): void {
    this.translations.set(key, { en, bn });
  }

  /**
   * Get all available translations
   */
  getAllTranslations(): Map<string, { en: string; bn: string }> {
    return this.translations;
  }
}

export const localLanguageHandler = new LocalLanguageHandler();