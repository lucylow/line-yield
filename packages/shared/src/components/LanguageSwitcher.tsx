import React from 'react';
import { Button } from './Button';
import { useLocalization } from '../contexts/LocalizationContext';
import { 
  Globe, 
  Check
} from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'buttons' | 'compact';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'buttons',
  showFlags = true,
  showNativeNames = true,
  className = ''
}) => {
  const { currentLanguage, setLanguage, supportedLanguages } = useLocalization();

  // Language flag emojis
  const languageFlags: Record<string, string> = {
    en: '🇺🇸',
    ja: '🇯🇵',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    zh: '🇨🇳',
    ko: '🇰🇷',
    ar: '🇸🇦',
    hi: '🇮🇳',
    pt: '🇧🇷',
    ru: '🇷🇺',
    it: '🇮🇹'
  };

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
  };

  // Buttons variant
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {supportedLanguages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-2"
          >
            {showFlags && (
              <span className="text-sm">
                {languageFlags[language.code] || '🌐'}
              </span>
            )}
            <span className="text-sm">
              {showNativeNames ? language.nativeName : language.name}
            </span>
            {currentLanguage === language.code && (
              <Check className="w-3 h-3" />
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Globe className="w-4 h-4 text-gray-500" />
        <div className="flex gap-1">
          {supportedLanguages.slice(0, 3).map((language) => (
            <Button
              key={language.code}
              variant={currentLanguage === language.code ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleLanguageChange(language.code)}
              className="p-1 h-6 w-6"
            >
              {showFlags ? (
                <span className="text-xs">
                  {languageFlags[language.code] || '🌐'}
                </span>
              ) : (
                <span className="text-xs">
                  {language.code.toUpperCase()}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};