# Multi-Language Support System

This document describes the comprehensive multi-language support system for the LINE Yield Mini Dapp, providing English and Japanese language support with automatic detection and manual switching capabilities.

## 🌍 Features

### Core Features
- **Automatic Language Detection**: Detects user's preferred language from browser settings
- **IP Geolocation**: Optional IP-based geolocation for enhanced language detection
- **Manual Language Switching**: Users can manually switch between English and Japanese
- **Persistent Language Preference**: Language choice is saved in localStorage
- **Comprehensive Translations**: 100+ translated strings covering all UI elements
- **Locale-Specific Formatting**: Numbers, dates, currencies, and percentages formatted according to locale

### Supported Languages
- **English (en)**: Default language with US formatting
- **Japanese (ja)**: Full Japanese translation with JP formatting

## 🚀 Quick Start

### Basic Usage

```tsx
import { useT, useLocalization } from '@shared/hooks';

function MyComponent() {
  const t = useT();
  const { lang, setLanguage } = useLocalization();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>Current language: {lang}</p>
      <button onClick={() => setLanguage('ja')}>
        Switch to Japanese
      </button>
    </div>
  );
}
```

### Using Formatting Functions

```tsx
import { useDateFormat, useCurrencyFormat, useNumberFormat, usePercentageFormat } from '@shared/hooks';

function FormattingExample() {
  const formatDate = useDateFormat();
  const formatCurrency = useCurrencyFormat();
  const formatNumber = useNumberFormat();
  const formatPercentage = usePercentageFormat();

  const date = new Date();
  const amount = 1234.56;
  const percentage = 8.64;

  return (
    <div>
      <p>Date: {formatDate(date)}</p>
      <p>Currency: {formatCurrency(amount, 'USD')}</p>
      <p>Number: {formatNumber(amount)}</p>
      <p>Percentage: {formatPercentage(percentage)}</p>
    </div>
  );
}
```

## 📚 API Reference

### Hooks

#### `useLocalization()`
Returns the current localization state and language switching function.

```tsx
const { lang, strings, setLanguage } = useLocalization();
```

**Returns:**
- `lang`: Current language code ('en' | 'ja')
- `strings`: Object containing all translated strings
- `setLanguage`: Function to change the language

#### `useT()`
Returns a translation function for getting localized strings.

```tsx
const t = useT();
const welcomeText = t('welcome'); // Returns localized welcome text
const fallbackText = t('nonexistent', 'Fallback text'); // Returns fallback if key doesn't exist
```

#### `useDateFormat()`
Returns a date formatting function that respects the current locale.

```tsx
const formatDate = useDateFormat();
const formatted = formatDate(new Date()); // "Dec 15, 2:30 PM" (EN) or "12月15日 14:30" (JA)
```

#### `useNumberFormat()`
Returns a number formatting function that respects the current locale.

```tsx
const formatNumber = useNumberFormat();
const formatted = formatNumber(1234.56); // "1,234.56" (EN) or "1,234.56" (JA)
```

#### `useCurrencyFormat()`
Returns a currency formatting function that respects the current locale.

```tsx
const formatCurrency = useCurrencyFormat();
const formatted = formatCurrency(1234.56, 'USD'); // "$1,234.56" (EN) or "¥1,234.56" (JA)
```

#### `usePercentageFormat()`
Returns a percentage formatting function that respects the current locale.

```tsx
const formatPercentage = usePercentageFormat();
const formatted = formatPercentage(8.64); // "8.64%" (EN) or "8.64%" (JA)
```

### Components

#### `LanguageSwitcher`
A dropdown component for switching between languages.

```tsx
import { LanguageSwitcher } from '@shared/components';

<LanguageSwitcher 
  variant="outline" 
  size="default" 
  className="custom-class" 
/>
```

**Props:**
- `variant`: Button variant ('default' | 'outline' | 'ghost')
- `size`: Button size ('sm' | 'default' | 'lg')
- `className`: Additional CSS classes

#### `LocalizationDemo`
A comprehensive demo component showcasing all localization features.

```tsx
import { LocalizationDemo } from '@shared/components';

<LocalizationDemo />
```

### Context Provider

#### `LocalizationProvider`
Provides localization context to child components.

```tsx
import { LocalizationProvider } from '@shared/contexts';

function App() {
  return (
    <LocalizationProvider>
      <YourApp />
    </LocalizationProvider>
  );
}
```

## 🎯 Translation Keys

### Common UI Elements
- `welcome`: Welcome message
- `connectWallet`: Connect wallet button text
- `deposit`: Deposit action
- `withdraw`: Withdraw action
- `balance`: Balance label
- `transactionHistory`: Transaction history title

### Transaction Types
- `transactionTypeDeposit`: Deposit transaction type
- `transactionTypeWithdraw`: Withdraw transaction type
- `transactionTypeYield`: Yield transaction type

### Transaction Status
- `statusPending`: Pending status
- `statusConfirmed`: Confirmed status
- `statusCompleted`: Completed status
- `statusFailed`: Failed status

### DeFi Specific
- `apy`: APY label
- `totalValueLocked`: Total Value Locked
- `totalAssets`: Total Assets
- `userShares`: User Shares
- `earnedYield`: Earned Yield
- `strategies`: Strategies

### Actions
- `buy`: Buy action
- `sell`: Sell action
- `swap`: Swap action
- `stake`: Stake action
- `unstake`: Unstake action
- `claim`: Claim action
- `transfer`: Transfer action

### Messages
- `welcomeMessage`: Welcome message
- `connectWalletMessage`: Connect wallet message
- `depositMessage`: Deposit message
- `withdrawMessage`: Withdraw message
- `yieldMessage`: Yield message

### Error Messages
- `connectionError`: Connection error message
- `transactionError`: Transaction error message
- `networkError`: Network error message
- `insufficientBalance`: Insufficient balance error

### Success Messages
- `walletConnectedSuccess`: Wallet connected success
- `depositSuccess`: Deposit success
- `withdrawSuccess`: Withdraw success
- `transactionSuccess`: Transaction success

## 🔧 Configuration

### Language Detection Priority
1. **Saved Preference**: Checks localStorage for 'preferred-language'
2. **Browser Language**: Detects from navigator.language
3. **IP Geolocation**: Optional IP-based detection (currently enabled)
4. **Fallback**: Defaults to English

### IP Geolocation
The system uses the free ipapi.co service for IP-based geolocation:
- Automatically detects Japanese users from IP
- Falls back gracefully if service is unavailable
- Respects user privacy (no personal data stored)

### Formatting Options
- **Numbers**: Locale-specific thousand separators and decimal points
- **Currency**: USD for English, JPY for Japanese
- **Dates**: US format for English, Japanese format for Japanese
- **Percentages**: Consistent formatting across locales

## 📱 LINE Mini Dapp Compliance

### Design Guidelines
- Follows LINE Mini Dapp design guidelines for multi-language support
- Provides English and Japanese as default languages
- Supports automatic language detection
- Maintains consistent UI/UX across languages

### Best Practices
- Use semantic translation keys
- Provide fallback text for missing translations
- Test UI layout with different text lengths
- Ensure proper RTL support if needed in future

## 🚀 Advanced Usage

### Custom Translation Keys
Add new translation keys to the `translations` object in `useLocalization.ts`:

```typescript
const translations: Record<SupportedLang, Record<string, string>> = {
  en: {
    // ... existing translations
    myCustomKey: 'My Custom Text',
  },
  ja: {
    // ... existing translations
    myCustomKey: '私のカスタムテキスト',
  },
};
```

### Custom Formatting
Use Intl API options for custom formatting:

```tsx
const formatDate = useDateFormat();
const customDate = formatDate(new Date(), {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### Adding New Languages
To add support for additional languages:

1. Add the language code to `SupportedLang` type
2. Add translations to the `translations` object
3. Update language detection logic
4. Add locale-specific formatting rules

## 🧪 Testing

### Manual Testing
1. Change browser language settings
2. Test IP geolocation with VPN
3. Verify localStorage persistence
4. Test manual language switching
5. Check formatting across locales

### Automated Testing
```tsx
import { renderHook } from '@testing-library/react';
import { useLocalization } from '@shared/hooks';

test('should detect Japanese language', () => {
  Object.defineProperty(navigator, 'language', {
    value: 'ja-JP',
    configurable: true,
  });
  
  const { result } = renderHook(() => useLocalization());
  expect(result.current.lang).toBe('ja');
});
```

## 🔍 Troubleshooting

### Common Issues

**Language not switching:**
- Check if localStorage is available
- Verify translation keys exist
- Check for JavaScript errors

**Formatting issues:**
- Ensure Intl API is supported
- Check locale-specific formatting rules
- Verify number/currency values are valid

**IP geolocation not working:**
- Check network connectivity
- Verify ipapi.co service availability
- Check for CORS issues

### Debug Mode
Enable debug logging by setting localStorage:
```javascript
localStorage.setItem('debug-localization', 'true');
```

## 📈 Performance Considerations

- Translations are loaded once and cached
- Formatting functions are memoized
- IP geolocation is optional and non-blocking
- Minimal bundle size impact

## 🔮 Future Enhancements

- Support for additional languages (Korean, Chinese)
- RTL (Right-to-Left) language support
- Dynamic translation loading
- Translation management system integration
- A/B testing for translations
- Voice-based language detection

---

This multi-language system provides a solid foundation for internationalizing the LINE Yield Mini Dapp while maintaining excellent user experience and performance.
