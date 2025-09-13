import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  translations, 
  supportedLanguages, 
  defaultLanguage, 
  getNestedTranslation, 
  extractTranslation,
  TranslationKeys 
} from '../data/translations';

interface LocalizationContextType {
  // Current language state
  currentLanguage: string;
  translations: TranslationKeys;
  
  // Language management functions
  setLanguage: (language: string) => void;
  getTranslation: (key: string) => string;
  t: (key: string) => string; // Short alias for getTranslation
  
  // Language information
  supportedLanguages: typeof supportedLanguages;
  isRTL: boolean;
  
  // Utility functions
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string | number) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
  initialLanguage?: string;
  storageKey?: string;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
  initialLanguage,
  storageKey = 'line-yield-language'
}) => {
  // Initialize language from props, localStorage, or browser preference
  const getInitialLanguage = (): string => {
    // 1. Check if language is provided as prop
    if (initialLanguage && translations[initialLanguage]) {
      return initialLanguage;
    }
    
    // 2. Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(storageKey);
      if (savedLanguage && translations[savedLanguage]) {
        return savedLanguage;
      }
      
      // 3. Check browser language preference
      const browserLanguage = navigator.language.split('-')[0];
      if (translations[browserLanguage]) {
        return browserLanguage;
      }
      
      // 4. Check if browser language is Japanese
      if (navigator.language.startsWith('ja')) {
        return 'ja';
      }
    }
    
    // 5. Fallback to default language
    return defaultLanguage;
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(getInitialLanguage);

  // Get current translations
  const currentTranslations = translations[currentLanguage] || translations[defaultLanguage];

  // Set language function
  const setLanguage = (language: string) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, language);
      }
      
      // Update document language attribute
      document.documentElement.lang = language;
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language } 
      }));
    }
  };

  // Get translation function with fallback
  const getTranslation = (key: string): string => {
    // Try to get translation from current language
    let translation = getNestedTranslation(currentTranslations, key);
    
    // If not found, try default language
    if (!translation || translation === key) {
      translation = getNestedTranslation(translations[defaultLanguage], key);
    }
    
    // If still not found, return the key itself
    if (!translation || translation === key) {
      return key;
    }
    
    // Extract translation from [translate:] markup if present
    return extractTranslation(translation);
  };

  // Short alias for getTranslation
  const t = getTranslation;

  // Check if current language is RTL
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he' || currentLanguage === 'fa';

  // Format number according to current locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return number.toString();
    }
  };

  // Format currency according to current locale
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    try {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      console.warn('Currency formatting error:', error);
      return `${amount} ${currency}`;
    }
  };

  // Format date according to current locale
  const formatDate = (
    date: Date | string | number, 
    options?: Intl.DateTimeFormatOptions
  ): string => {
    try {
      const dateObj = new Date(date);
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      }).format(dateObj);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return new Date(date).toLocaleDateString();
    }
  };

  // Format relative time (e.g., "2 hours ago", "in 3 days")
  const formatRelativeTime = (date: Date | string | number): string => {
    try {
      const dateObj = new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
      
      const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });
      
      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
      } else if (Math.abs(diffInSeconds) < 2592000) {
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
      } else if (Math.abs(diffInSeconds) < 31536000) {
        return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
      } else {
        return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
      }
    } catch (error) {
      console.warn('Relative time formatting error:', error);
      return new Date(date).toLocaleDateString();
    }
  };

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  // Listen for language change events from other parts of the app
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { language } = event.detail;
      if (language !== currentLanguage && translations[language]) {
        setCurrentLanguage(language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [currentLanguage]);

  const contextValue: LocalizationContextType = {
    currentLanguage,
    translations: currentTranslations,
    setLanguage,
    getTranslation,
    t,
    supportedLanguages,
    isRTL,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook to use localization context
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  
  return context;
};

// Higher-order component for easy translation
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { t } = useLocalization();
    return <Component {...props} t={t} />;
  };
};

// Hook for getting translations with type safety
export const useTranslation = () => {
  const { t, currentLanguage, supportedLanguages } = useLocalization();
  
  return {
    t,
    currentLanguage,
    supportedLanguages,
    isEnglish: currentLanguage === 'en',
    isJapanese: currentLanguage === 'ja'
  };
};

export default LocalizationContext;