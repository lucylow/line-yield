import { SupportedLanguage, LanguageDetectionMethod } from '../i18n';

// Language detection utilities for frontend
export const detectLanguageFromBrowser = (): SupportedLanguage => {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check for Japanese
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  
  // Default to English
  return 'en';
};

export const detectLanguageFromIP = async (): Promise<SupportedLanguage> => {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Check if country is Japan
    if (data.country_code === 'JP') {
      return 'ja';
    }
    
    return 'en';
  } catch (error) {
    console.warn('Failed to detect language from IP:', error);
    return 'en'; // Fallback to English
  }
};

export const detectLanguageFromURL = (): SupportedLanguage | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam && ['en', 'ja'].includes(langParam)) {
    return langParam as SupportedLanguage;
  }
  
  return null;
};

export const detectLanguageFromLocalStorage = (): SupportedLanguage | null => {
  const savedLanguage = localStorage.getItem('line-yield-language') as SupportedLanguage;
  
  if (savedLanguage && ['en', 'ja'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  return null;
};

export const detectLanguageFromCookie = (): SupportedLanguage | null => {
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(cookie => cookie.trim().startsWith('line-yield-language='));
  
  if (langCookie) {
    const langValue = langCookie.split('=')[1];
    if (langValue && ['en', 'ja'].includes(langValue)) {
      return langValue as SupportedLanguage;
    }
  }
  
  return null;
};

export const autoDetectLanguage = async (
  method: LanguageDetectionMethod = 'browser'
): Promise<SupportedLanguage> => {
  try {
    // Check URL parameter first (highest priority)
    const urlLang = detectLanguageFromURL();
    if (urlLang) {
      return urlLang;
    }
    
    // Check localStorage
    const savedLang = detectLanguageFromLocalStorage();
    if (savedLang) {
      return savedLang;
    }
    
    // Check cookie
    const cookieLang = detectLanguageFromCookie();
    if (cookieLang) {
      return cookieLang;
    }
    
    // Auto-detect based on method
    switch (method) {
      case 'ip':
        return await detectLanguageFromIP();
      case 'browser':
      default:
        return detectLanguageFromBrowser();
    }
  } catch (error) {
    console.warn('Language detection failed:', error);
    return 'en'; // Fallback to English
  }
};

export const saveLanguagePreference = (
  language: SupportedLanguage,
  method: LanguageDetectionMethod = 'manual'
): void => {
  // Save to localStorage
  localStorage.setItem('line-yield-language', language);
  localStorage.setItem('line-yield-language-method', method);
  
  // Save to cookie (expires in 1 year)
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `line-yield-language=${language}; expires=${expires.toUTCString()}; path=/`;
};

export const getLanguagePreference = (): {
  language: SupportedLanguage;
  method: LanguageDetectionMethod;
} => {
  const language = detectLanguageFromLocalStorage() || 'en';
  const method = (localStorage.getItem('line-yield-language-method') as LanguageDetectionMethod) || 'browser';
  
  return { language, method };
};

export const clearLanguagePreference = (): void => {
  localStorage.removeItem('line-yield-language');
  localStorage.removeItem('line-yield-language-method');
  
  // Clear cookie
  document.cookie = 'line-yield-language=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Language-specific utilities
export const isRTL = (language: SupportedLanguage): boolean => {
  // Currently no RTL languages supported
  return false;
};

export const getLanguageDirection = (language: SupportedLanguage): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const getLanguageName = (language: SupportedLanguage): string => {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    ja: '日本語',
  };
  
  return names[language];
};

export const getLanguageFlag = (language: SupportedLanguage): string => {
  const flags: Record<SupportedLanguage, string> = {
    en: '🇺🇸',
    ja: '🇯🇵',
  };
  
  return flags[language];
};

export const getSupportedLanguages = (): Array<{
  code: SupportedLanguage;
  name: string;
  flag: string;
}> => {
  return [
    { code: 'en', name: getLanguageName('en'), flag: getLanguageFlag('en') },
    { code: 'ja', name: getLanguageName('ja'), flag: getLanguageFlag('ja') },
  ];
};

export default {
  detectLanguageFromBrowser,
  detectLanguageFromIP,
  detectLanguageFromURL,
  detectLanguageFromLocalStorage,
  detectLanguageFromCookie,
  autoDetectLanguage,
  saveLanguagePreference,
  getLanguagePreference,
  clearLanguagePreference,
  isRTL,
  getLanguageDirection,
  getLanguageName,
  getLanguageFlag,
  getSupportedLanguages,
};
