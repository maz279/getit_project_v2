/**
 * useLanguage Hook
 * Amazon.com/Shopee.sg-Level Language Management
 * React hook for localization with Bengali and English support
 */

import { useState, useEffect } from 'react';
import LocalizationService from '../services/advanced/LocalizationService';

interface UseLanguageReturn {
  language: string;
  t: (key: string, language?: string) => string;
  setLanguage: (language: string) => void;
  supportedLanguages: string[];
  isLanguageSupported: (language: string) => boolean;
  formatNumber: (number: number, language?: string) => string;
  formatCurrency: (amount: number, currency?: string, language?: string) => string;
  formatDate: (date: Date, language?: string) => string;
  getLanguageDisplayName: (language: string) => string;
  metrics: {
    totalKeys: number;
    translatedKeys: number;
    completionRate: number;
    missingTranslations: string[];
  };
}

export const useLanguage = (): UseLanguageReturn => {
  const localizationService = LocalizationService.getInstance();
  const [language, setLanguageState] = useState(localizationService.getCurrentLanguage());
  const [metrics, setMetrics] = useState(localizationService.getMetrics());

  useEffect(() => {
    const unsubscribe = localizationService.subscribe((newLanguage) => {
      setLanguageState(newLanguage);
      setMetrics(localizationService.getMetrics());
    });

    return unsubscribe;
  }, []);

  const setLanguage = (newLanguage: string) => {
    localizationService.setLanguage(newLanguage);
  };

  const t = (key: string, lang?: string) => {
    return localizationService.t(key, lang);
  };

  const formatNumber = (number: number, lang?: string) => {
    return localizationService.formatNumber(number, lang);
  };

  const formatCurrency = (amount: number, currency?: string, lang?: string) => {
    return localizationService.formatCurrency(amount, currency, lang);
  };

  const formatDate = (date: Date, lang?: string) => {
    return localizationService.formatDate(date, lang);
  };

  const getLanguageDisplayName = (lang: string) => {
    return localizationService.getLanguageDisplayName(lang);
  };

  const isLanguageSupported = (lang: string) => {
    return localizationService.isLanguageSupported(lang);
  };

  return {
    language,
    t,
    setLanguage,
    supportedLanguages: localizationService.getSupportedLanguages(),
    isLanguageSupported,
    formatNumber,
    formatCurrency,
    formatDate,
    getLanguageDisplayName,
    metrics
  };
};

export default useLanguage;