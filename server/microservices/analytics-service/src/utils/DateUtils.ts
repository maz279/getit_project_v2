/**
 * Date Utilities
 * Advanced date handling for Amazon.com/Shopee.sg-level analytics
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BangladeshFestival {
  name: string;
  nameEn: string;
  nameBn: string;
  date: Date;
  type: 'religious' | 'national' | 'cultural';
  significance: string;
}

export class DateUtils {

  /**
   * Get predefined date ranges for analytics
   */
  static getCommonDateRanges(): Record<string, DateRange> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today: {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      yesterday: {
        startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 1)
      },
      last7Days: {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: today
      },
      last30Days: {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: today
      },
      last90Days: {
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: today
      },
      thisWeek: {
        startDate: this.getStartOfWeek(today),
        endDate: this.getEndOfWeek(today)
      },
      lastWeek: {
        startDate: this.getStartOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
        endDate: this.getEndOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))
      },
      thisMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      },
      lastMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      },
      thisQuarter: {
        startDate: this.getStartOfQuarter(now),
        endDate: this.getEndOfQuarter(now)
      },
      lastQuarter: {
        startDate: this.getStartOfQuarter(new Date(now.getFullYear(), now.getMonth() - 3, 1)),
        endDate: this.getEndOfQuarter(new Date(now.getFullYear(), now.getMonth() - 3, 1))
      },
      thisYear: {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      },
      lastYear: {
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        endDate: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      }
    };
  }

  /**
   * Get Bangladesh-specific festivals and important dates
   */
  static getBangladeshFestivals(year: number): BangladeshFestival[] {
    // These dates are approximate and would need to be updated annually
    // In production, this would integrate with a calendar API
    return [
      {
        name: 'Independence Day',
        nameEn: 'Independence Day',
        nameBn: 'স্বাধীনতা দিবস',
        date: new Date(year, 2, 26), // March 26
        type: 'national',
        significance: 'Bangladesh Independence from Pakistan in 1971'
      },
      {
        name: 'Victory Day',
        nameEn: 'Victory Day',
        nameBn: 'বিজয় দিবস',
        date: new Date(year, 11, 16), // December 16
        type: 'national',
        significance: 'Victory in the Liberation War of 1971'
      },
      {
        name: 'Pohela Boishakh',
        nameEn: 'Bengali New Year',
        nameBn: 'পহেলা বৈশাখ',
        date: new Date(year, 3, 14), // April 14
        type: 'cultural',
        significance: 'First day of the Bengali calendar'
      },
      {
        name: 'International Mother Language Day',
        nameEn: 'International Mother Language Day',
        nameBn: 'আন্তর্জাতিক মাতৃভাষা দিবস',
        date: new Date(year, 1, 21), // February 21
        type: 'national',
        significance: 'Language Movement martyrs day'
      },
      {
        name: 'Eid ul-Fitr',
        nameEn: 'Eid ul-Fitr',
        nameBn: 'ঈদুল ফিতর',
        date: new Date(year, 3, 21), // Approximate - varies by lunar calendar
        type: 'religious',
        significance: 'End of Ramadan fasting month'
      },
      {
        name: 'Eid ul-Adha',
        nameEn: 'Eid ul-Adha',
        nameBn: 'ঈদুল আজহা',
        date: new Date(year, 5, 28), // Approximate - varies by lunar calendar
        type: 'religious',
        significance: 'Festival of Sacrifice'
      },
      {
        name: 'Durga Puja',
        nameEn: 'Durga Puja',
        nameBn: 'দুর্গা পূজা',
        date: new Date(year, 9, 15), // Approximate - varies by lunar calendar
        type: 'religious',
        significance: 'Hindu festival celebrating goddess Durga'
      }
    ];
  }

  /**
   * Check if a date falls within a festival period
   */
  static getFestivalForDate(date: Date): BangladeshFestival | null {
    const festivals = this.getBangladeshFestivals(date.getFullYear());
    
    return festivals.find(festival => {
      const festivalDate = festival.date;
      const dayBefore = new Date(festivalDate.getTime() - 24 * 60 * 60 * 1000);
      const dayAfter = new Date(festivalDate.getTime() + 24 * 60 * 60 * 1000);
      
      return date >= dayBefore && date <= dayAfter;
    }) || null;
  }

  /**
   * Get business hours for Bangladesh
   */
  static getBangladeshBusinessHours(): {
    weekdays: { start: string; end: string };
    friday: { start: string; end: string };
    weekend: string[];
    timezone: string;
  } {
    return {
      weekdays: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '13:00' }, // Half day before Jummah
      weekend: ['Friday', 'Saturday'], // Friday and Saturday are weekends in Bangladesh
      timezone: 'Asia/Dhaka'
    };
  }

  /**
   * Check if date is within business hours
   */
  static isBusinessHour(date: Date): boolean {
    const businessHours = this.getBangladeshBusinessHours();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (businessHours.weekend.includes(dayName)) {
      return false;
    }

    const timeString = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (dayName === 'Friday') {
      return timeString >= businessHours.friday.start && timeString <= businessHours.friday.end;
    } else {
      return timeString >= businessHours.weekdays.start && timeString <= businessHours.weekdays.end;
    }
  }

  /**
   * Generate date ranges for time series analysis
   */
  static generateTimeSeriesRanges(
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month'
  ): DateRange[] {
    const ranges: DateRange[] = [];
    let current = new Date(startDate);

    while (current < endDate) {
      let next: Date;
      
      switch (interval) {
        case 'hour':
          next = new Date(current.getTime() + 60 * 60 * 1000);
          break;
        case 'day':
          next = new Date(current.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          next = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          next = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
          break;
        default:
          next = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      }

      ranges.push({
        startDate: new Date(current),
        endDate: new Date(Math.min(next.getTime() - 1, endDate.getTime()))
      });

      current = next;
    }

    return ranges;
  }

  /**
   * Format date for different locales
   */
  static formatDate(
    date: Date,
    format: 'short' | 'long' | 'iso' | 'bangladesh' | 'relative' = 'short'
  ): string {
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US');
      case 'long':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'bangladesh':
        return date.toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'relative':
        return this.getRelativeTimeString(date);
      default:
        return date.toLocaleDateString('en-US');
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "3 days ago")
   */
  static getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Private helper methods
   */
  private static getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(date.setDate(diff));
  }

  private static getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(new Date(date));
    return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000);
  }

  private static getStartOfQuarter(date: Date): Date {
    const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), quarterMonth, 1);
  }

  private static getEndOfQuarter(date: Date): Date {
    const quarterMonth = Math.floor(date.getMonth() / 3) * 3 + 3;
    return new Date(date.getFullYear(), quarterMonth, 0, 23, 59, 59, 999);
  }

  /**
   * Convert Bangladesh timezone to UTC
   */
  static bangladeshToUTC(date: Date): Date {
    // Bangladesh is UTC+6
    return new Date(date.getTime() - 6 * 60 * 60 * 1000);
  }

  /**
   * Convert UTC to Bangladesh timezone
   */
  static utcToBangladesh(date: Date): Date {
    // Bangladesh is UTC+6
    return new Date(date.getTime() + 6 * 60 * 60 * 1000);
  }

  /**
   * Check if two dates are in the same period
   */
  static areSamePeriod(
    date1: Date,
    date2: Date,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): boolean {
    switch (period) {
      case 'day':
        return date1.toDateString() === date2.toDateString();
      case 'week':
        const week1 = this.getStartOfWeek(new Date(date1));
        const week2 = this.getStartOfWeek(new Date(date2));
        return week1.getTime() === week2.getTime();
      case 'month':
        return date1.getFullYear() === date2.getFullYear() && 
               date1.getMonth() === date2.getMonth();
      case 'quarter':
        return date1.getFullYear() === date2.getFullYear() && 
               Math.floor(date1.getMonth() / 3) === Math.floor(date2.getMonth() / 3);
      case 'year':
        return date1.getFullYear() === date2.getFullYear();
      default:
        return false;
    }
  }
}

export default DateUtils;