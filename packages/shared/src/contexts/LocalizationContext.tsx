import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalization } from '../hooks/useLocalization';

type SupportedLang = 'en' | 'ja';

interface LocalizationContextType {
  lang: SupportedLang;
  strings: Record<string, string>;
  setLanguage: (lang: SupportedLang) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const localization = useLocalization();

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationContext = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalizationContext must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationProvider;
