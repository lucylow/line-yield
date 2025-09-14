import React from 'react';
import { useLanguage, SupportedLanguage } from '../i18n';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'buttons' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showLabel = true,
  variant = 'dropdown'
}) => {
  const { language, setLanguage, detectionMethod, setDetectionMethod, t } = useLanguage();

  const languages = [
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
    { code: 'ja' as SupportedLanguage, name: '日本語', flag: '🇯🇵' },
  ];

  const detectionMethods = [
    { code: 'browser' as const, name: t('common.browser'), description: t('common.browserDetection') },
    { code: 'ip' as const, name: t('common.ip'), description: t('common.ipDetection') },
    { code: 'manual' as const, name: t('common.manual'), description: t('common.manualSelection') },
  ];

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {t('common.language')}:
          </span>
        )}
        <div className="flex space-x-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                language === lang.code
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {t('common.language')}:
          </span>
        )}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Globe className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Detection Method Selector */}
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">
          {t('common.detectionMethod')}:
        </label>
        <div className="flex space-x-2">
          {detectionMethods.map((method) => (
            <button
              key={method.code}
              onClick={() => setDetectionMethod(method.code)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                detectionMethod === method.code
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
              title={method.description}
            >
              {method.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
