import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '../contexts/LocalizationContext';
import { 
  Globe, 
  Check, 
  ChevronDown,
  Languages
} from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'compact';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true,
  className = ''
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false);
  };

  const getCurrentLanguageInfo = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  const currentLang = getCurrentLanguageInfo();

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${className}`}
          >
            {showFlags && (
              <span className="text-lg">
                {languageFlags[currentLanguage] || '🌐'}
              </span>
            )}
            <span className="font-medium">
              {showNativeNames ? currentLang.nativeName : currentLang.name}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          {supportedLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {showFlags && (
                <span className="text-lg">
                  {languageFlags[language.code] || '🌐'}
                </span>
              )}
              
              <div className="flex-1">
                <div className="font-medium">
                  {showNativeNames ? language.nativeName : language.name}
                </div>
                {showNativeNames && language.nativeName !== language.name && (
                  <div className="text-sm text-gray-500">
                    {language.name}
                  </div>
                )}
              </div>
              
              {currentLanguage === language.code && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Buttons variant
  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {supportedLanguages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'default' : 'outline'}
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
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${className}`}
          >
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-40">
          {supportedLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-sm">
                {languageFlags[language.code] || '🌐'}
              </span>
              <span className="text-sm font-medium">
                {language.nativeName}
              </span>
              {currentLanguage === language.code && (
                <Check className="w-3 h-3 text-green-600 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
};

// Language indicator component (shows current language without switching)
export const LanguageIndicator: React.FC<{
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}> = ({ showFlag = true, showName = true, className = '' }) => {
  const { currentLanguage, supportedLanguages } = useLocalization();
  
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

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showFlag && (
        <span className="text-sm">
          {languageFlags[currentLanguage] || '🌐'}
        </span>
      )}
      {showName && (
        <span className="text-sm font-medium">
          {currentLang.nativeName}
        </span>
      )}
    </div>
  );
};

// Language settings component for settings page
export const LanguageSettings: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { currentLanguage, supportedLanguages, setLanguage, t } = useLocalization();

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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Languages className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {supportedLanguages.map((language) => (
          <div
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              currentLanguage === language.code
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {languageFlags[language.code] || '🌐'}
              </span>
              
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {language.nativeName}
                </div>
                <div className="text-sm text-gray-500">
                  {language.name}
                </div>
              </div>
              
              {currentLanguage === language.code && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <Badge variant="default" className="text-xs">
                    {t('common.selected')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500">
        {t('settings.languageDescription')}
      </div>
    </div>
  );
};

export default LanguageSwitcher;