import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Custom hook for easy translation access
 * Provides type-safe translation functions and language utilities
 */
export const useTranslation = () => {
  const { 
    t, 
    currentLanguage, 
    supportedLanguages, 
    isRTL,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime
  } = useLocalization();

  return {
    // Translation function
    t,
    
    // Language information
    currentLanguage,
    supportedLanguages,
    isRTL,
    
    // Language checks
    isEnglish: currentLanguage === 'en',
    isJapanese: currentLanguage === 'ja',
    
    // Formatting functions
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    
    // Utility functions
    translate: t, // Alias for t
    getTranslation: t, // Another alias
  };
};

/**
 * Hook for getting translations with interpolation support
 * Supports simple variable substitution in translations
 */
export const useTranslationWithInterpolation = () => {
  const { t, currentLanguage } = useLocalization();

  const translateWithVars = (key: string, variables?: Record<string, string | number>) => {
    let translation = t(key);
    
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        const placeholder = `{{${varKey}}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }
    
    return translation;
  };

  return {
    t: translateWithVars,
    currentLanguage,
    translate: translateWithVars,
  };
};

/**
 * Hook for pluralization support
 * Handles singular/plural forms based on count
 */
export const usePluralization = () => {
  const { t, currentLanguage } = useLocalization();

  const pluralize = (key: string, count: number, variables?: Record<string, string | number>) => {
    // For now, we'll use a simple approach
    // In a more sophisticated implementation, you'd use libraries like i18next
    const baseKey = key;
    const pluralKey = `${key}_plural`;
    
    // Try to get plural form first
    let translation = t(pluralKey);
    
    // If plural form doesn't exist or count is 1, use singular
    if (translation === pluralKey || count === 1) {
      translation = t(baseKey);
    }
    
    // Replace count variable
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        const placeholder = `{{${varKey}}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), String(value));
      });
    } else {
      translation = translation.replace(/\{\{count\}\}/g, String(count));
    }
    
    return translation;
  };

  return {
    pluralize,
    currentLanguage,
  };
};

/**
 * Hook for date/time formatting with locale support
 */
export const useDateTimeFormatting = () => {
  const { currentLanguage, formatDate, formatRelativeTime } = useLocalization();

  const formatDateTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  const formatTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    return formatDate(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options
    });
  };

  const formatShortDate = (date: Date | string | number) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLongDate = (date: Date | string | number) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return {
    formatDate,
    formatDateTime,
    formatTime,
    formatShortDate,
    formatLongDate,
    formatRelativeTime,
    currentLanguage,
  };
};

/**
 * Hook for number formatting with locale support
 */
export const useNumberFormatting = () => {
  const { currentLanguage, formatNumber, formatCurrency } = useLocalization();

  const formatPercentage = (value: number, decimals: number = 2) => {
    return formatNumber(value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatCompactNumber = (value: number) => {
    return formatNumber(value, {
      notation: 'compact',
      compactDisplay: 'short'
    });
  };

  const formatDecimal = (value: number, decimals: number = 2) => {
    return formatNumber(value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatInteger = (value: number) => {
    return formatNumber(value, {
      maximumFractionDigits: 0
    });
  };

  return {
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatCompactNumber,
    formatDecimal,
    formatInteger,
    currentLanguage,
  };
};

export default useTranslation;



