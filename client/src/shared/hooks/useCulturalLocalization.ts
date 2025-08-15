/**
 * Cultural Localization Hook
 * Provides comprehensive cultural and religious localization for Bangladesh market
 * including Bengali language, Islamic features, and local preferences
 * 
 * @fileoverview Enterprise cultural localization hook for Bangladesh market
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Professional Polish Implementation
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Supported languages
 */
type SupportedLanguage = 'bn' | 'en';

/**
 * Cultural context type
 */
type CulturalContext = 'bangladesh' | 'global';

/**
 * Islamic calendar months
 */
type IslamicMonth = 'muharram' | 'safar' | 'rabiAwal' | 'rabiThani' | 'jumadaAwal' | 'jumadaThani' | 'rajab' | 'shaban' | 'ramadan' | 'shawwal' | 'zilqad' | 'zilhajj';

/**
 * Prayer times interface
 */
interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qiyam?: string;
}

/**
 * Islamic date interface
 */
interface IslamicDate {
  day: number;
  month: IslamicMonth;
  year: number;
  monthName: string;
  monthNameBengali: string;
}

/**
 * Cultural events interface
 */
interface CulturalEvent {
  id: string;
  name: string;
  nameBengali: string;
  date: Date;
  islamicDate?: IslamicDate;
  type: 'islamic' | 'national' | 'cultural';
  significance: 'high' | 'medium' | 'low';
  description: string;
  descriptionBengali: string;
  businessImpact: {
    closedBusinesses: boolean;
    increasedShopping: boolean;
    specialOffers: boolean;
  };
}

/**
 * Bengali number system
 */
interface BengaliNumbers {
  western: string;
  bengali: string;
}

/**
 * Cultural preferences interface
 */
interface CulturalPreferences {
  language: SupportedLanguage;
  calendar: 'gregorian' | 'islamic' | 'bengali';
  numberSystem: 'western' | 'bengali';
  currency: 'BDT' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  startOfWeek: 'friday' | 'saturday' | 'sunday';
  prayerNotifications: boolean;
  halalOnly: boolean;
  showIslamicCalendar: boolean;
  showBengaliCalendar: boolean;
  culturalDiscounts: boolean;
}

/**
 * Localization data interface
 */
interface LocalizationData {
  currentLanguage: SupportedLanguage;
  culturalContext: CulturalContext;
  preferences: CulturalPreferences;
  prayerTimes: PrayerTimes | null;
  islamicDate: IslamicDate | null;
  upcomingEvents: CulturalEvent[];
  currentSeason: 'winter' | 'spring' | 'summer' | 'monsoon' | 'autumn';
  isRamadan: boolean;
  isEidPeriod: boolean;
  nextPrayerTime: {
    name: string;
    time: string;
    remaining: number;
  } | null;
}

/**
 * Cultural localization hook return type
 */
interface CulturalLocalizationReturn {
  localizationData: LocalizationData;
  updatePreferences: (preferences: Partial<CulturalPreferences>) => void;
  translate: (key: string, fallback?: string) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  getPrayerTimes: (latitude: number, longitude: number) => Promise<PrayerTimes>;
  getIslamicDate: (date?: Date) => IslamicDate;
  getUpcomingEvents: () => CulturalEvent[];
  isBusinessDay: (date: Date) => boolean;
  getSeasonalGreeting: () => string;
  getHalalStatus: (productId: string) => Promise<boolean>;
  getCulturalDiscounts: () => Promise<{ percentage: number; reason: string }[]>;
  getBengaliDayName: (date: Date) => string;
  getIslamicMonthName: (month: IslamicMonth) => { english: string; bengali: string };
}

/**
 * Enterprise Cultural Localization Hook
 * 
 * Provides comprehensive cultural and religious localization for Bangladesh market:
 * - Bengali language translation system
 * - Islamic calendar and prayer times
 * - Cultural events and holidays tracking
 * - Halal product certification
 * - Bengali number system support
 * - Seasonal and religious greetings
 * - Cultural discount management
 * - Prayer time notifications
 * - Islamic date conversions
 * 
 * @example
 * ```tsx
 * const {
 *   localizationData,
 *   translate,
 *   formatCurrency,
 *   getPrayerTimes,
 *   getSeasonalGreeting
 * } = useCulturalLocalization({
 *   language: 'bn',
 *   culturalContext: 'bangladesh',
 *   prayerNotifications: true
 * });
 * 
 * // Translate text
 * const welcomeText = translate('welcome', 'Welcome');
 * 
 * // Format currency
 * const price = formatCurrency(1500); // "৳১,৫০০"
 * 
 * // Get seasonal greeting
 * const greeting = getSeasonalGreeting(); // "রমজান মুবারক"
 * ```
 * 
 * @param initialPreferences - Initial cultural preferences
 * @returns {CulturalLocalizationReturn} Cultural localization utilities
 */
export function useCulturalLocalization(
  initialPreferences: Partial<CulturalPreferences> = {}
): CulturalLocalizationReturn {
  // Default preferences
  const defaultPreferences: CulturalPreferences = {
    language: 'bn',
    calendar: 'gregorian',
    numberSystem: 'bengali',
    currency: 'BDT',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    startOfWeek: 'friday',
    prayerNotifications: true,
    halalOnly: false,
    showIslamicCalendar: true,
    showBengaliCalendar: true,
    culturalDiscounts: true,
    ...initialPreferences
  };

  // State management
  const [localizationData, setLocalizationData] = useState<LocalizationData>({
    currentLanguage: defaultPreferences.language,
    culturalContext: 'bangladesh',
    preferences: defaultPreferences,
    prayerTimes: null,
    islamicDate: null,
    upcomingEvents: [],
    currentSeason: 'winter',
    isRamadan: false,
    isEidPeriod: false,
    nextPrayerTime: null
  });

  // Translation dictionary
  const translations: { [key: string]: { bn: string; en: string } } = {
    // Common translations
    'welcome': { bn: 'স্বাগতম', en: 'Welcome' },
    'hello': { bn: 'হ্যালো', en: 'Hello' },
    'thank_you': { bn: 'ধন্যবাদ', en: 'Thank you' },
    'please': { bn: 'দয়া করে', en: 'Please' },
    'yes': { bn: 'হ্যাঁ', en: 'Yes' },
    'no': { bn: 'না', en: 'No' },
    
    // E-commerce specific
    'add_to_cart': { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
    'buy_now': { bn: 'এখনই কিনুন', en: 'Buy Now' },
    'price': { bn: 'দাম', en: 'Price' },
    'discount': { bn: 'ছাড়', en: 'Discount' },
    'free_shipping': { bn: 'ফ্রি ডেলিভারি', en: 'Free Shipping' },
    'out_of_stock': { bn: 'স্টক শেষ', en: 'Out of Stock' },
    'in_stock': { bn: 'স্টক আছে', en: 'In Stock' },
    'order_now': { bn: 'অর্ডার করুন', en: 'Order Now' },
    'track_order': { bn: 'অর্ডার ট্র্যাক করুন', en: 'Track Order' },
    'payment': { bn: 'পেমেন্ট', en: 'Payment' },
    'checkout': { bn: 'চেকআউট', en: 'Checkout' },
    
    // Islamic/Cultural
    'prayer_times': { bn: 'নামাজের সময়', en: 'Prayer Times' },
    'halal_certified': { bn: 'হালাল সার্টিফাইড', en: 'Halal Certified' },
    'ramadan_special': { bn: 'রমজান স্পেশাল', en: 'Ramadan Special' },
    'eid_collection': { bn: 'ঈদ কালেকশন', en: 'Eid Collection' },
    'islamic_calendar': { bn: 'ইসলামিক ক্যালেন্ডার', en: 'Islamic Calendar' },
    
    // Prayer names
    'fajr': { bn: 'ফজর', en: 'Fajr' },
    'dhuhr': { bn: 'যোহর', en: 'Dhuhr' },
    'asr': { bn: 'আছর', en: 'Asr' },
    'maghrib': { bn: 'মাগরিব', en: 'Maghrib' },
    'isha': { bn: 'এশা', en: 'Isha' },
    
    // Days of week
    'friday': { bn: 'শুক্রবার', en: 'Friday' },
    'saturday': { bn: 'শনিবার', en: 'Saturday' },
    'sunday': { bn: 'রবিবার', en: 'Sunday' },
    'monday': { bn: 'সোমবার', en: 'Monday' },
    'tuesday': { bn: 'মঙ্গলবার', en: 'Tuesday' },
    'wednesday': { bn: 'বুধবার', en: 'Wednesday' },
    'thursday': { bn: 'বৃহস্পতিবার', en: 'Thursday' },
    
    // Months
    'january': { bn: 'জানুয়ারি', en: 'January' },
    'february': { bn: 'ফেব্রুয়ারি', en: 'February' },
    'march': { bn: 'মার্চ', en: 'March' },
    'april': { bn: 'এপ্রিল', en: 'April' },
    'may': { bn: 'মে', en: 'May' },
    'june': { bn: 'জুন', en: 'June' },
    'july': { bn: 'জুলাই', en: 'July' },
    'august': { bn: 'আগস্ট', en: 'August' },
    'september': { bn: 'সেপ্টেম্বর', en: 'September' },
    'october': { bn: 'অক্টোবর', en: 'October' },
    'november': { bn: 'নভেম্বর', en: 'November' },
    'december': { bn: 'ডিসেম্বর', en: 'December' }
  };

  // Bengali numbers mapping
  const bengaliNumbers: BengaliNumbers[] = [
    { western: '0', bengali: '০' },
    { western: '1', bengali: '১' },
    { western: '2', bengali: '২' },
    { western: '3', bengali: '৩' },
    { western: '4', bengali: '৪' },
    { western: '5', bengali: '৫' },
    { western: '6', bengali: '৬' },
    { western: '7', bengali: '৭' },
    { western: '8', bengali: '৮' },
    { western: '9', bengali: '৯' }
  ];

  /**
   * Update cultural preferences
   */
  const updatePreferences = useCallback((newPreferences: Partial<CulturalPreferences>) => {
    setLocalizationData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPreferences },
      currentLanguage: newPreferences.language || prev.currentLanguage
    }));
    
    // Save to localStorage
    localStorage.setItem('cultural_preferences', JSON.stringify({
      ...localizationData.preferences,
      ...newPreferences
    }));
  }, [localizationData.preferences]);

  /**
   * Translate text based on current language
   */
  const translate = useCallback((key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[localizationData.currentLanguage] || translation.en;
    }
    return fallback || key;
  }, [localizationData.currentLanguage]);

  /**
   * Format number based on number system preference
   */
  const formatNumber = useCallback((number: number): string => {
    const formattedNumber = number.toLocaleString();
    
    if (localizationData.preferences.numberSystem === 'bengali') {
      let bengaliNumber = formattedNumber;
      bengaliNumbers.forEach(({ western, bengali }) => {
        bengaliNumber = bengaliNumber.replace(new RegExp(western, 'g'), bengali);
      });
      return bengaliNumber;
    }
    
    return formattedNumber;
  }, [localizationData.preferences.numberSystem]);

  /**
   * Format currency based on cultural preferences
   */
  const formatCurrency = useCallback((amount: number): string => {
    const formattedAmount = formatNumber(amount);
    
    if (localizationData.preferences.currency === 'BDT') {
      return `৳${formattedAmount}`;
    }
    
    return `$${amount.toFixed(2)}`;
  }, [formatNumber, localizationData.preferences.currency]);

  /**
   * Format date based on cultural preferences
   */
  const formatDate = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const formattedDay = formatNumber(day);
    const formattedMonth = formatNumber(month);
    const formattedYear = formatNumber(year);
    
    switch (localizationData.preferences.dateFormat) {
      case 'DD/MM/YYYY':
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
      case 'MM/DD/YYYY':
        return `${formattedMonth}/${formattedDay}/${formattedYear}`;
      case 'YYYY-MM-DD':
        return `${formattedYear}-${formattedMonth.padStart(2, '0')}-${formattedDay.padStart(2, '0')}`;
      default:
        return date.toLocaleDateString();
    }
  }, [formatNumber, localizationData.preferences.dateFormat]);

  /**
   * Format time based on cultural preferences
   */
  const formatTime = useCallback((date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: localizationData.preferences.timeFormat === '12h'
    };
    
    const formattedTime = date.toLocaleTimeString('en-US', options);
    
    if (localizationData.preferences.numberSystem === 'bengali') {
      let bengaliTime = formattedTime;
      bengaliNumbers.forEach(({ western, bengali }) => {
        bengaliTime = bengaliTime.replace(new RegExp(western, 'g'), bengali);
      });
      return bengaliTime;
    }
    
    return formattedTime;
  }, [localizationData.preferences.timeFormat, localizationData.preferences.numberSystem]);

  /**
   * Get prayer times for given coordinates
   */
  const getPrayerTimes = useCallback(async (latitude: number, longitude: number): Promise<PrayerTimes> => {
    try {
      // This would typically call an Islamic prayer times API
      // For demo purposes, returning sample times for Dhaka
      const sampleTimes: PrayerTimes = {
        fajr: '05:15',
        sunrise: '06:35',
        dhuhr: '12:10',
        asr: '15:30',
        maghrib: '17:45',
        isha: '19:05'
      };
      
      setLocalizationData(prev => ({
        ...prev,
        prayerTimes: sampleTimes
      }));
      
      return sampleTimes;
    } catch (error) {
      console.error('Failed to fetch prayer times:', error);
      throw error;
    }
  }, []);

  /**
   * Get Islamic date for given date
   */
  const getIslamicDate = useCallback((date: Date = new Date()): IslamicDate => {
    // Simplified Islamic date calculation
    // In a real implementation, this would use a proper Islamic calendar library
    const hijriYear = Math.floor((date.getFullYear() - 622) * 1.030684);
    const hijriMonth = (date.getMonth() + 1) % 12;
    const hijriDay = date.getDate();
    
    const monthNames: { [key: number]: { month: IslamicMonth; english: string; bengali: string } } = {
      1: { month: 'muharram', english: 'Muharram', bengali: 'মুহররম' },
      2: { month: 'safar', english: 'Safar', bengali: 'সফর' },
      3: { month: 'rabiAwal', english: 'Rabi al-Awwal', bengali: 'রবিউল আউয়াল' },
      4: { month: 'rabiThani', english: 'Rabi al-Thani', bengali: 'রবিউস সানি' },
      5: { month: 'jumadaAwal', english: 'Jumada al-Awwal', bengali: 'জমাদিউল আউয়াল' },
      6: { month: 'jumadaThani', english: 'Jumada al-Thani', bengali: 'জমাদিউস সানি' },
      7: { month: 'rajab', english: 'Rajab', bengali: 'রজব' },
      8: { month: 'shaban', english: 'Shaban', bengali: 'শাবান' },
      9: { month: 'ramadan', english: 'Ramadan', bengali: 'রমজান' },
      10: { month: 'shawwal', english: 'Shawwal', bengali: 'শাওয়াল' },
      11: { month: 'zilqad', english: 'Dhu al-Qadah', bengali: 'জিলকদ' },
      12: { month: 'zilhajj', english: 'Dhu al-Hijjah', bengali: 'জিলহজ' }
    };
    
    const monthInfo = monthNames[hijriMonth] || monthNames[1];
    
    return {
      day: hijriDay,
      month: monthInfo.month,
      year: hijriYear,
      monthName: monthInfo.english,
      monthNameBengali: monthInfo.bengali
    };
  }, []);

  /**
   * Get upcoming cultural events
   */
  const getUpcomingEvents = useCallback((): CulturalEvent[] => {
    const currentDate = new Date();
    const events: CulturalEvent[] = [
      {
        id: 'eid_ul_fitr',
        name: 'Eid ul-Fitr',
        nameBengali: 'ঈদুল ফিতর',
        date: new Date(currentDate.getFullYear(), 4, 15), // May 15th (approximate)
        type: 'islamic',
        significance: 'high',
        description: 'Festival marking the end of Ramadan',
        descriptionBengali: 'রমজানের শেষে উদযাপিত উৎসব',
        businessImpact: {
          closedBusinesses: true,
          increasedShopping: true,
          specialOffers: true
        }
      },
      {
        id: 'eid_ul_adha',
        name: 'Eid ul-Adha',
        nameBengali: 'ঈদুল আযহা',
        date: new Date(currentDate.getFullYear(), 6, 20), // July 20th (approximate)
        type: 'islamic',
        significance: 'high',
        description: 'Festival of Sacrifice',
        descriptionBengali: 'কুরবানির ঈদ',
        businessImpact: {
          closedBusinesses: true,
          increasedShopping: true,
          specialOffers: true
        }
      },
      {
        id: 'independence_day',
        name: 'Independence Day',
        nameBengali: 'স্বাধীনতা দিবস',
        date: new Date(currentDate.getFullYear(), 2, 26), // March 26th
        type: 'national',
        significance: 'high',
        description: 'Bangladesh Independence Day',
        descriptionBengali: 'বাংলাদেশের স্বাধীনতা দিবস',
        businessImpact: {
          closedBusinesses: true,
          increasedShopping: false,
          specialOffers: true
        }
      },
      {
        id: 'pohela_boishakh',
        name: 'Pohela Boishakh',
        nameBengali: 'পহেলা বৈশাখ',
        date: new Date(currentDate.getFullYear(), 3, 14), // April 14th
        type: 'cultural',
        significance: 'high',
        description: 'Bengali New Year',
        descriptionBengali: 'বাংলা নববর্ষ',
        businessImpact: {
          closedBusinesses: false,
          increasedShopping: true,
          specialOffers: true
        }
      }
    ];
    
    // Filter upcoming events
    return events.filter(event => event.date > currentDate)
                 .sort((a, b) => a.date.getTime() - b.date.getTime())
                 .slice(0, 5);
  }, []);

  /**
   * Check if date is a business day
   */
  const isBusinessDay = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    
    // In Bangladesh, Friday is the weekly holiday
    if (localizationData.preferences.startOfWeek === 'friday') {
      return dayOfWeek !== 5; // Friday is not a business day
    }
    
    // Standard weekend (Saturday-Sunday)
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }, [localizationData.preferences.startOfWeek]);

  /**
   * Get seasonal greeting based on current time
   */
  const getSeasonalGreeting = useCallback((): string => {
    const now = new Date();
    const islamicDate = getIslamicDate(now);
    
    // Check for Ramadan
    if (islamicDate.month === 'ramadan') {
      return localizationData.currentLanguage === 'bn' ? 'রমজান মুবারক' : 'Ramadan Mubarak';
    }
    
    // Check for Eid periods
    if (islamicDate.month === 'shawwal' && islamicDate.day <= 3) {
      return localizationData.currentLanguage === 'bn' ? 'ঈদ মুবারক' : 'Eid Mubarak';
    }
    
    // Seasonal greetings
    const month = now.getMonth();
    if (month >= 2 && month <= 4) {
      return localizationData.currentLanguage === 'bn' ? 'সুপ্রভাত' : 'Good Morning';
    }
    
    return localizationData.currentLanguage === 'bn' ? 'আসসালামু আলাইকুম' : 'Assalamu Alaikum';
  }, [localizationData.currentLanguage, getIslamicDate]);

  /**
   * Get halal status for product
   */
  const getHalalStatus = useCallback(async (productId: string): Promise<boolean> => {
    try {
      // This would typically call a halal certification API
      // For demo purposes, returning true for most products
      return Math.random() > 0.1; // 90% of products are halal
    } catch (error) {
      console.error('Failed to check halal status:', error);
      return false;
    }
  }, []);

  /**
   * Get cultural discounts
   */
  const getCulturalDiscounts = useCallback(async (): Promise<{ percentage: number; reason: string }[]> => {
    const discounts = [];
    const now = new Date();
    const islamicDate = getIslamicDate(now);
    
    // Ramadan discount
    if (islamicDate.month === 'ramadan') {
      discounts.push({
        percentage: 15,
        reason: localizationData.currentLanguage === 'bn' ? 'রমজান বিশেষ ছাড়' : 'Ramadan Special Discount'
      });
    }
    
    // Eid discount
    if (islamicDate.month === 'shawwal' && islamicDate.day <= 10) {
      discounts.push({
        percentage: 25,
        reason: localizationData.currentLanguage === 'bn' ? 'ঈদ বিশেষ ছাড়' : 'Eid Special Discount'
      });
    }
    
    return discounts;
  }, [localizationData.currentLanguage, getIslamicDate]);

  /**
   * Get Bengali day name
   */
  const getBengaliDayName = useCallback((date: Date): string => {
    const dayNames = [
      'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
    ];
    return dayNames[date.getDay()];
  }, []);

  /**
   * Get Islamic month name in both languages
   */
  const getIslamicMonthName = useCallback((month: IslamicMonth): { english: string; bengali: string } => {
    const monthNames: { [key in IslamicMonth]: { english: string; bengali: string } } = {
      'muharram': { english: 'Muharram', bengali: 'মুহররম' },
      'safar': { english: 'Safar', bengali: 'সফর' },
      'rabiAwal': { english: 'Rabi al-Awwal', bengali: 'রবিউল আউয়াল' },
      'rabiThani': { english: 'Rabi al-Thani', bengali: 'রবিউস সানি' },
      'jumadaAwal': { english: 'Jumada al-Awwal', bengali: 'জমাদিউল আউয়াল' },
      'jumadaThani': { english: 'Jumada al-Thani', bengali: 'জমাদিউস সানি' },
      'rajab': { english: 'Rajab', bengali: 'রজব' },
      'shaban': { english: 'Shaban', bengali: 'শাবান' },
      'ramadan': { english: 'Ramadan', bengali: 'রমজান' },
      'shawwal': { english: 'Shawwal', bengali: 'শাওয়াল' },
      'zilqad': { english: 'Dhu al-Qadah', bengali: 'জিলকদ' },
      'zilhajj': { english: 'Dhu al-Hijjah', bengali: 'জিলহজ' }
    };
    
    return monthNames[month];
  }, []);

  // Initialize cultural data on mount
  useEffect(() => {
    const initializeCulturalData = async () => {
      // Load saved preferences
      const savedPreferences = localStorage.getItem('cultural_preferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        updatePreferences(parsed);
      }
      
      // Get current Islamic date
      const islamicDate = getIslamicDate();
      
      // Determine if it's Ramadan or Eid period
      const isRamadan = islamicDate.month === 'ramadan';
      const isEidPeriod = (islamicDate.month === 'shawwal' && islamicDate.day <= 10) ||
                         (islamicDate.month === 'zilhajj' && islamicDate.day >= 8 && islamicDate.day <= 13);
      
      // Get upcoming events
      const upcomingEvents = getUpcomingEvents();
      
      setLocalizationData(prev => ({
        ...prev,
        islamicDate,
        upcomingEvents,
        isRamadan,
        isEidPeriod
      }));
    };

    initializeCulturalData();
  }, []);

  return {
    localizationData,
    updatePreferences,
    translate,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    getPrayerTimes,
    getIslamicDate,
    getUpcomingEvents,
    isBusinessDay,
    getSeasonalGreeting,
    getHalalStatus,
    getCulturalDiscounts,
    getBengaliDayName,
    getIslamicMonthName
  };
}

export default useCulturalLocalization;