import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Translation } from '../i18n/translations';

interface SimpleLanguageContextType {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  t: Translation;
  isRTL: boolean;
}

const SimpleLanguageContext = createContext<SimpleLanguageContextType | undefined>(undefined);

export const useSimpleLanguage = () => {
  const context = useContext(SimpleLanguageContext);
  if (!context) {
    throw new Error('useSimpleLanguage must be used within a SimpleLanguageProvider');
  }
  return context;
};

export const SimpleLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'bn'>('en'); // Default to English

  const t = translations[language];
  const isRTL = language === 'bn'; // Bengali can be RTL in some contexts

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('getit-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Update document language and direction
    document.documentElement.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const handleSetLanguage = (lang: 'en' | 'bn') => {
    setLanguage(lang);
    localStorage.setItem('getit-language', lang);
  };

  return (
    <SimpleLanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t, 
      isRTL 
    }}>
      {children}
    </SimpleLanguageContext.Provider>
  );
};