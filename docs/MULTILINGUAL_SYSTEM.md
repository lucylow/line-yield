# Multilingual System Documentation

## Overview

The LINE Yield dApp implements a comprehensive multilingual system with English as the default language and Japanese as the secondary language. The system is designed to be easily extensible for additional languages while maintaining type safety and providing excellent developer experience.

## Key Features

- **Default Language**: English
- **Secondary Language**: Japanese with `[translate:]` markup
- **Automatic Fallback**: Falls back to English if translation is missing
- **Language Persistence**: Saves user preference in localStorage
- **Browser Detection**: Automatically detects browser language preference
- **Type Safety**: TypeScript interfaces for all translation keys
- **Number & Date Formatting**: Locale-aware formatting for numbers, currencies, and dates
- **RTL Support**: Ready for right-to-left languages
- **Easy Extension**: Simple process to add new languages

## Architecture

### Core Components

1. **Translation Data** (`packages/shared/src/data/translations.ts`)
   - Structured translation keys with TypeScript interfaces
   - English as default, Japanese with `[translate:]` markup
   - Organized by feature areas (common, wallet, tokens, etc.)

2. **Localization Context** (`packages/shared/src/contexts/LocalizationContext.tsx`)
   - React Context for language state management
   - Automatic language detection and persistence
   - Formatting utilities for numbers, dates, and currencies

3. **Language Switcher** (`packages/shared/src/components/LanguageSwitcher.tsx`)
   - Multiple UI variants (dropdown, buttons, compact)
   - Language settings component for settings pages
   - Language indicator component

4. **Translation Hooks** (`packages/shared/src/hooks/useTranslation.ts`)
   - Easy-to-use hooks for components
   - Number and date formatting hooks
   - Pluralization support (ready for future implementation)

## Usage Examples

### Basic Translation

```tsx
import { useTranslation } from '@shared/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('landing.title')}</h1>
      <p>{t('landing.description')}</p>
      <button>{t('common.confirm')}</button>
    </div>
  );
};
```

### Language Switcher

```tsx
import { LanguageSwitcher } from '@shared/components/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      <h1>LINE Yield</h1>
      <LanguageSwitcher variant="dropdown" />
    </header>
  );
};
```

### Number and Date Formatting

```tsx
import { useNumberFormatting, useDateTimeFormatting } from '@shared/hooks/useTranslation';

const StatsComponent = () => {
  const { formatNumber, formatCurrency, formatPercentage } = useNumberFormatting();
  const { formatDate, formatRelativeTime } = useDateTimeFormatting();
  
  const balance = 1250.75;
  const apy = 8.64;
  const lastTransaction = new Date();
  
  return (
    <div>
      <p>Balance: {formatCurrency(balance, 'USD')}</p>
      <p>APY: {formatPercentage(apy / 100)}</p>
      <p>Last Transaction: {formatDate(lastTransaction)}</p>
      <p>Time: {formatRelativeTime(lastTransaction)}</p>
    </div>
  );
};
```

### Language Settings Page

```tsx
import { LanguageSettings } from '@shared/components/LanguageSwitcher';

const SettingsPage = () => {
  return (
    <div>
      <h1>Settings</h1>
      <LanguageSettings />
    </div>
  );
};
```

## Translation Key Structure

The translation keys are organized hierarchically by feature area:

```typescript
interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    success: string;
    // ... more common UI elements
  };
  
  navigation: {
    home: string;
    dashboard: string;
    wallet: string;
    // ... more navigation items
  };
  
  wallet: {
    connect: string;
    disconnect: string;
    balance: string;
    // ... more wallet-related terms
  };
  
  tokens: {
    tokenBalance: string;
    stakeTokens: string;
    claimRewards: string;
    // ... more token-related terms
  };
  
  // ... more feature areas
}
```

## Adding New Languages

### Step 1: Add Language to Supported Languages

```typescript
// In packages/shared/src/data/translations.ts
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' }, // New language
];
```

### Step 2: Add Translation Data

```typescript
// In packages/shared/src/data/translations.ts
export const translations: Record<string, TranslationKeys> = {
  en: { /* existing English translations */ },
  ja: { /* existing Japanese translations */ },
  es: { // New Spanish translations
    common: {
      loading: "[translate:Cargando...]",
      error: "[translate:Error]",
      success: "[translate:Éxito]",
      // ... more translations
    },
    // ... other sections
  }
};
```

### Step 3: Add Language Flag (Optional)

```typescript
// In LanguageSwitcher component
const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  ja: '🇯🇵',
  es: '🇪🇸', // New flag
  // ... more flags
};
```

## Translation Markup Convention

### English (Default)
- Plain text without any markup
- Used as fallback for missing translations

```typescript
en: {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success"
  }
}
```

### Non-English Languages
- Wrapped in `[translate:...]` markup
- Contains the actual translation text

```typescript
ja: {
  common: {
    loading: "[translate:読み込み中...]",
    error: "[translate:エラー]",
    success: "[translate:成功]"
  }
}
```

## Language Detection Priority

The system detects the user's preferred language in the following order:

1. **Explicit Setting**: Language set via props to LocalizationProvider
2. **Saved Preference**: Language saved in localStorage from previous session
3. **Browser Language**: Primary language from navigator.language
4. **Japanese Detection**: Special detection for Japanese browsers
5. **Default Fallback**: English as the final fallback

## Formatting Features

### Number Formatting
- Automatic locale-aware number formatting
- Currency formatting with proper symbols
- Percentage formatting
- Compact notation for large numbers

### Date Formatting
- Locale-aware date formatting
- Relative time formatting ("2 hours ago", "in 3 days")
- Customizable date format options

### RTL Support
- Automatic direction detection for RTL languages
- Document direction updates when language changes
- Ready for Arabic, Hebrew, Persian, etc.

## Integration with Existing Components

### App.tsx Integration

```tsx
import { LocalizationProvider } from "@shared/contexts";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider>
      <TooltipProvider>
        <AppWrapper>
          <AppContent />
        </AppWrapper>
      </TooltipProvider>
    </LocalizationProvider>
  </QueryClientProvider>
);
```

### Component Integration

```tsx
// Before (English only)
const TokenPanel = () => (
  <div>
    <h2>Token Balance</h2>
    <button>Stake Tokens</button>
  </div>
);

// After (Multilingual)
const TokenPanel = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('tokens.tokenBalance')}</h2>
      <button>{t('tokens.stakeTokens')}</button>
    </div>
  );
};
```

## Best Practices

### 1. Use Descriptive Keys
```typescript
// Good
t('tokens.stakeTokens')
t('wallet.connectWallet')
t('errors.insufficientFunds')

// Avoid
t('button1')
t('text2')
t('error')
```

### 2. Group Related Translations
```typescript
// Good - grouped by feature
tokens: {
  stakeTokens: string;
  unstakeTokens: string;
  claimRewards: string;
}

// Avoid - flat structure
stakeTokens: string;
unstakeTokens: string;
claimRewards: string;
```

### 3. Use Formatting Functions
```typescript
// Good - locale-aware formatting
const { formatCurrency } = useNumberFormatting();
formatCurrency(1250.75, 'USD') // "$1,250.75" or "1.250,75 $"

// Avoid - manual formatting
`$${amount.toFixed(2)}` // Always "$1250.75"
```

### 4. Handle Missing Translations Gracefully
```typescript
// The system automatically falls back to English
// But you can also provide fallbacks in your code
const title = t('some.key') || 'Default Title';
```

## Testing

### Language Switching Test
```typescript
// Test that language switching works
const { setLanguage } = useLocalization();
setLanguage('ja');
// Verify UI updates to Japanese
```

### Translation Coverage Test
```typescript
// Test that all keys have translations
Object.keys(translations.en).forEach(key => {
  expect(translations.ja[key]).toBeDefined();
});
```

## Performance Considerations

- **Lazy Loading**: Translation data is loaded once and cached
- **Minimal Re-renders**: Only components using translations re-render on language change
- **Efficient Lookup**: O(1) translation key lookup using nested object access
- **Memory Efficient**: Shared translation objects across components

## Browser Support

- **Modern Browsers**: Full support for all features
- **Legacy Browsers**: Graceful degradation with English fallback
- **Mobile Browsers**: Full support including touch interactions
- **Screen Readers**: Proper language attributes for accessibility

## Future Enhancements

1. **Pluralization**: Advanced pluralization rules for different languages
2. **Gender Agreement**: Gender-aware translations for languages that require it
3. **Context-Aware Translations**: Different translations based on context
4. **Translation Management**: Integration with translation management systems
5. **Auto-Translation**: Integration with translation APIs for rapid prototyping

## Troubleshooting

### Common Issues

1. **Translation Not Showing**
   - Check if key exists in translation data
   - Verify key path is correct
   - Ensure component is wrapped in LocalizationProvider

2. **Language Not Persisting**
   - Check localStorage is available
   - Verify storage key is correct
   - Check for browser storage restrictions

3. **Formatting Issues**
   - Verify locale data is available
   - Check number/date format options
   - Test with different browsers

### Debug Mode

```typescript
// Enable debug logging
const { t, currentLanguage } = useTranslation();
console.log('Current language:', currentLanguage);
console.log('Translation result:', t('some.key'));
```

## Conclusion

The multilingual system provides a robust foundation for internationalizing the LINE Yield dApp. With English as the default language and Japanese as the secondary language, the system ensures excellent user experience for both language groups while maintaining developer productivity and code maintainability.

The system is designed to scale easily as the application grows and new languages are added, making it a long-term solution for global user reach.



