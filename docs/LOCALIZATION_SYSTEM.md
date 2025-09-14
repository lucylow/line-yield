# Localization System Documentation

## Overview

The LINE Yield platform includes a comprehensive localization system that supports English and Japanese languages. The system automatically detects user language preferences based on browser settings or IP geolocation, with manual override capabilities.

## Features

- **Automatic Language Detection**: Browser language detection and IP-based geolocation
- **Manual Language Selection**: Users can manually override language preferences
- **Persistent Preferences**: Language choices are saved in localStorage and cookies
- **Backend Localization**: API responses are localized based on user preferences
- **Frontend Localization**: All UI components support multiple languages
- **LINE Mini Dapp Support**: Localization works in LINE mini dapp environment

## Supported Languages

- **English (en)**: Default language
- **Japanese (ja)**: Full Japanese localization

## Architecture

### Frontend Components

#### 1. Language Provider (`src/i18n/index.ts`)
- React context provider for language management
- Translation function (`t`) for accessing localized strings
- Language detection and persistence
- Support for browser, IP, and manual detection methods

#### 2. Language Switcher (`src/components/LanguageSwitcher.tsx`)
- UI component for changing language preferences
- Multiple variants: dropdown, buttons, compact
- Shows detection method options
- Real-time language switching

#### 3. Language Detection Utilities (`src/utils/language-detection.ts`)
- Browser language detection
- IP-based geolocation detection
- URL parameter detection
- LocalStorage and cookie management
- Preference persistence and retrieval

### Backend Components

#### 1. Localization Service (`backend/src/services/localization-service.ts`)
- Singleton service for backend localization
- Translation management
- Language detection utilities
- Support for all API endpoints

#### 2. Localization Middleware (`backend/src/middleware/localization-middleware.ts`)
- Express middleware for automatic language detection
- Request/response language headers
- Manual override support via query parameters
- IP and browser detection methods

## Usage

### Frontend Usage

#### Basic Translation
```tsx
import { useTranslation } from '../i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

#### Language Switching
```tsx
import { useLanguage } from '../i18n';

function LanguageControls() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

#### Language Detection
```tsx
import { autoDetectLanguage } from '../utils/language-detection';

async function initializeLanguage() {
  const detectedLanguage = await autoDetectLanguage('browser');
  console.log('Detected language:', detectedLanguage);
}
```

### Backend Usage

#### Middleware Integration
```typescript
import { localizationMiddleware } from '../middleware/localization-middleware';

app.use(localizationMiddleware({
  defaultLanguage: 'en',
  detectionMethod: 'browser',
  enableIPDetection: true,
  enableBrowserDetection: true,
  enableManualOverride: true,
}));
```

#### Route Handler Usage
```typescript
app.get('/api/example', (req, res) => {
  const t = req.t || ((key: string) => key);
  
  res.json({
    message: t('api.welcome'),
    language: req.language,
  });
});
```

## Language Detection Methods

### 1. Browser Detection
- Uses `navigator.language` or `navigator.userLanguage`
- Checks for Japanese language codes (`ja`, `ja-JP`)
- Defaults to English if not detected

### 2. IP Geolocation Detection
- Uses IP geolocation service (ipapi.co)
- Detects Japanese users based on country code
- Fallback to English on service failure

### 3. Manual Override
- URL parameter: `?lang=ja`
- Header: `X-Language: ja`
- Query parameter: `lang=ja`

### 4. Persistent Preferences
- LocalStorage: `line-yield-language`
- Cookie: `line-yield-language`
- Method tracking: `line-yield-language-method`

## Translation Keys Structure

```typescript
interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    success: string;
    // ... more common terms
  };
  navigation: {
    home: string;
    dashboard: string;
    // ... navigation items
  };
  wallet: {
    connect: string;
    disconnect: string;
    // ... wallet terms
  };
  nftCollateral: {
    title: string;
    description: string;
    // ... NFT collateral terms
  };
  marketplace: {
    title: string;
    description: string;
    // ... marketplace terms
  };
  qrPayment: {
    title: string;
    description: string;
    // ... QR payment terms
  };
  errors: {
    networkError: string;
    walletNotConnected: string;
    // ... error messages
  };
  success: {
    walletConnected: string;
    transactionSubmitted: string;
    // ... success messages
  };
}
```

## API Integration

### Request Headers
- `Accept-Language`: Browser language preference
- `X-Language`: Manual language override

### Response Headers
- `X-Language`: Detected/set language
- `X-Language-Detection-Method`: Detection method used

### Query Parameters
- `lang`: Manual language override (en|ja)

## LINE Mini Dapp Integration

The localization system is fully integrated with the LINE mini dapp:

1. **LIFF Environment**: Language detection works in LINE's LIFF environment
2. **Shared Components**: Language switcher available in mini dapp
3. **Persistent Preferences**: Language choices persist across LINE app sessions
4. **Mobile Optimization**: Compact language switcher for mobile interfaces

## Configuration

### Frontend Configuration
```typescript
// Language detection priority
const detectionPriority = [
  'url',           // URL parameter
  'localStorage',  // Saved preference
  'cookie',        // Cookie preference
  'browser',       // Browser language
  'ip',           // IP geolocation
];
```

### Backend Configuration
```typescript
// Middleware options
const options = {
  defaultLanguage: 'en',
  detectionMethod: 'browser',
  enableIPDetection: true,
  enableBrowserDetection: true,
  enableManualOverride: true,
};
```

## Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys
- Group related translations
- Use consistent naming conventions
- Include context in key names

### 2. Language Detection
- Always provide fallbacks
- Cache detection results
- Respect user preferences
- Handle detection failures gracefully

### 3. Performance
- Lazy load translation files
- Cache translations in memory
- Minimize API calls for detection
- Use efficient key lookups

### 4. User Experience
- Show loading states during detection
- Provide clear language options
- Maintain context during language switches
- Preserve user preferences

## Testing

### Frontend Testing
```typescript
// Test language detection
import { detectLanguageFromBrowser } from '../utils/language-detection';

test('detects Japanese from browser', () => {
  Object.defineProperty(navigator, 'language', {
    value: 'ja-JP',
    configurable: true,
  });
  
  expect(detectLanguageFromBrowser()).toBe('ja');
});
```

### Backend Testing
```typescript
// Test middleware
import { localizationMiddleware } from '../middleware/localization-middleware';

test('detects language from header', async () => {
  const req = {
    headers: { 'accept-language': 'ja-JP' },
    ip: '127.0.0.1',
  };
  
  const middleware = localizationMiddleware();
  // Test middleware behavior
});
```

## Troubleshooting

### Common Issues

1. **Language not detected**: Check browser language settings
2. **IP detection fails**: Verify network connectivity and service availability
3. **Translations missing**: Ensure all keys are defined in translation files
4. **Preferences not saved**: Check localStorage and cookie permissions

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('line-yield-debug', 'true');

// Check current language state
console.log('Current language:', getLanguagePreference());
```

## Future Enhancements

1. **Additional Languages**: Support for Korean, Chinese, etc.
2. **RTL Support**: Right-to-left language support
3. **Pluralization**: Advanced pluralization rules
4. **Date/Number Formatting**: Locale-specific formatting
5. **Dynamic Loading**: Load translations on demand
6. **Translation Management**: Admin interface for translations

## Contributing

When adding new translations:

1. Add keys to the `TranslationKeys` interface
2. Provide translations for both English and Japanese
3. Update relevant components to use translations
4. Test language switching functionality
5. Update documentation

## Support

For localization issues:
- Check browser console for errors
- Verify translation keys exist
- Test language detection methods
- Contact development team for assistance
