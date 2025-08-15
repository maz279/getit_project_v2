/**
 * PHASE 4: PERFORMANCE-OPTIMIZED INFO GENERATION HOOK
 * Centralized info generation logic with enhanced memoization and performance optimization
 * Date: July 26, 2025
 */

import { useMemo, useCallback } from 'react';
import { InfoByte, InfoVisual, InfoVisualDataPoint, Recommendation, SearchResultsType, EnhancedSearchResults } from '../types/searchTypes';

export const useInfoGeneration = (query: string, language: 'en' | 'bn', searchResults: SearchResultsType) => {
  // ✅ PHASE 4: Memoized info generation - addresses P1
  const infobytes = useMemo(() => generateInfoBytes(query, language, searchResults), [query, language, searchResults]);
  
  const recommendations = useMemo(() => generateRecommendations(query, language, searchResults), [query, language, searchResults]);
  
  const infoVisuals = useMemo(() => generateInfoVisuals(query, language), [query, language]);

  return { infobytes, recommendations, infoVisuals };
};

// ✅ FIXED: Type-safe data access with null guards - addresses C3
const generateInfoBytes = (searchQuery: string, language: 'en' | 'bn', searchResults: SearchResultsType): InfoByte[] => {
  // Safe access to enhanced search results
  const enhancedResults = searchResults as EnhancedSearchResults;
  if (enhancedResults?.data?.infobytes && enhancedResults.data.infobytes.length > 0) {
    return enhancedResults.data.infobytes.map((byte: InfoByte) => ({
      id: byte.id,
      title: byte.title,
      content: byte.content,
      icon: byte.icon || '💡',
      type: byte.type || 'tip',
      color: byte.color || 'blue'
    }));
  }

  // Fallback to local generation for backward compatibility
  const lowerQuery = searchQuery.toLowerCase();
  const infobytes: InfoByte[] = [];

  if (lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
    infobytes.push({
      id: 'buying-tip',
      title: language === 'bn' ? '💡 ক্রয় টিপস' : '💡 Buying Tips',
      content: language === 'bn' ? 
        'কেনাকাটার আগে রিভিউ পড়ুন, দাম তুলনা করুন এবং রিটার্ন পলিসি চেক করুন।' :
        'Read reviews, compare prices, and check return policies before purchasing.',
      icon: 'lightbulb',
      type: 'tip',
      color: 'yellow'
    });
  }

  if (lowerQuery.includes('computer') || lowerQuery.includes('laptop')) {
    infobytes.push({
      id: 'tech-trend',
      title: language === 'bn' ? '📈 টেক ট্রেন্ড' : '📈 Tech Trends',
      content: language === 'bn' ? 
        'AI এবং মেশিন লার্নিং চালিত কম্পিউটারের চাহিদা ২০২৫ সালে ৪৫% বৃদ্ধি পেয়েছে।' :
        'AI and ML-powered computers are seeing 45% increased demand in 2025.',
      icon: 'trending-up',
      type: 'trend',
      color: 'blue'
    });
  }

  if (lowerQuery.includes('phone') || lowerQuery.includes('mobile')) {
    infobytes.push({
      id: 'mobile-fact',
      title: language === 'bn' ? '📱 মোবাইল ফ্যাক্ট' : '📱 Mobile Fact',
      content: language === 'bn' ? 
        'বাংলাদেশে ৫জি নেটওয়ার্ক কভারেজ ৮৫% এ পৌঁছেছে, দ্রুত ডেটা স্পিড নিশ্চিত করে।' :
        '5G network coverage in Bangladesh has reached 85%, ensuring faster data speeds.',
      icon: 'zap',
      type: 'fact',
      color: 'green'
    });
  }

  return infobytes;
};

const generateRecommendations = (searchQuery: string, language: 'en' | 'bn', searchResults: SearchResultsType): Recommendation[] => {
  const lowerQuery = searchQuery.toLowerCase();
  const recommendations: Recommendation[] = [];

  if (lowerQuery.includes('computer') || lowerQuery.includes('laptop')) {
    recommendations.push(
      {
        id: 'laptop-accessories',
        title: language === 'bn' ? 'ল্যাপটপ এক্সেসরিজ' : 'Laptop Accessories',
        description: language === 'bn' ? 'মাউস, কিবোর্ড, ল্যাপটপ ব্যাগ' : 'Mouse, keyboard, laptop bag',
        price: language === 'bn' ? '৳২,৫০০' : '৳2,500',
        rating: 4.5,
        category: 'accessories',
        badge: language === 'bn' ? 'জনপ্রিয়' : 'Popular'
      },
      {
        id: 'laptop-stand',
        title: language === 'bn' ? 'ল্যাপটপ স্ট্যান্ড' : 'Laptop Stand',
        description: language === 'bn' ? 'এরগনমিক ডিজাইন' : 'Ergonomic design',
        price: language === 'bn' ? '৳১,২০০' : '৳1,200',
        rating: 4.3,
        category: 'accessories'
      }
    );
  }

  if (lowerQuery.includes('phone') || lowerQuery.includes('mobile')) {
    recommendations.push(
      {
        id: 'phone-case',
        title: language === 'bn' ? 'ফোন কেস' : 'Phone Case',
        description: language === 'bn' ? 'ড্রপ প্রুফ প্রোটেকশন' : 'Drop-proof protection',
        price: language === 'bn' ? '৳৮০০' : '৳800',
        rating: 4.6,
        category: 'accessories',
        badge: language === 'bn' ? 'বেস্ট সেলার' : 'Best Seller'
      },
      {
        id: 'wireless-charger',
        title: language === 'bn' ? 'ওয়্যারলেস চার্জার' : 'Wireless Charger',
        description: language === 'bn' ? 'ফাস্ট চার্জিং' : 'Fast charging',
        price: language === 'bn' ? '৳১,৫০০' : '৳1,500',
        rating: 4.4,
        category: 'accessories'
      }
    );
  }

  return recommendations;
};

const generateInfoVisuals = (searchQuery: string, language: 'en' | 'bn'): InfoVisual[] => {
  const lowerQuery = searchQuery.toLowerCase();
  const visuals: InfoVisual[] = [];

  if (lowerQuery.includes('computer') || lowerQuery.includes('laptop')) {
    visuals.push({
      id: 'price-trend',
      title: language === 'bn' ? 'দামের ট্রেন্ড' : 'Price Trends',
      type: 'trend',
      data: [
        { label: 'Jan', value: 65000 },
        { label: 'Feb', value: 62000 },
        { label: 'Mar', value: 58000 },
        { label: 'Apr', value: 55000 }
      ],
      description: language === 'bn' ? 'গত ৪ মাসে কম্পিউটারের দাম ১৫% কমেছে' : 'Computer prices decreased 15% in last 4 months'
    });
  }

  return visuals;
};