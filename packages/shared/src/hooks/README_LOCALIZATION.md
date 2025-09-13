# Localization System for LINE Mini Dapp

This localization system provides automatic language detection and translation support for English and Japanese in your LINE Mini Dapp.

## Features

- **Automatic Language Detection**: Detects user's browser language settings
- **IP-based Geolocation**: Optional IP-based detection for more accurate locale detection
- **Comprehensive Translations**: Pre-built translations for common UI elements
- **Type Safety**: Full TypeScript support with proper typing
- **Easy Extension**: Simple to add new languages or translation keys

## Usage

### Basic Hook Usage

```tsx
import { useLocalization } from '../hooks';

function MyComponent() {
  const { lang, strings } = useLocalization();
  
  return (
    <div>
      <h1>{strings.welcome}</h1>
      <p>Current language: {lang}</p>
    </div>
  );
}
```

### Using the Translation Helper

```tsx
import { useT } from '../hooks';

function MyComponent() {
  const t = useT();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('connectWallet')}</button>
      <p>{t('nonexistentKey', 'Fallback text')}</p>
    </div>
  );
}
```

### Date Formatting

```tsx
import { useDateFormat } from '../hooks';

function MyComponent() {
  const formatDate = useDateFormat();
  const date = new Date();
  
  return (
    <div>
      <p>{formatDate(date)}</p>
      <p>{formatDate(date, { year: 'numeric', month: 'long' })}</p>
    </div>
  );
}
```

## Available Translation Keys

### Common UI Strings
- `welcome` - Welcome message
- `connectWallet` - Connect wallet button text
- `deposit` - Deposit action
- `withdraw` - Withdraw action
- `yield` - Yield/earnings
- `balance` - Balance display
- `transactionHistory` - Transaction history title
- `noTransactions` - No transactions message
- `transactionHistoryDescription` - Transaction history description

### Transaction Types
- `transactionTypeDeposit` - Deposit transaction type
- `transactionTypeWithdraw` - Withdraw transaction type
- `transactionTypeYield` - Yield transaction type

### Transaction Status
- `statusPending` - Pending status
- `statusConfirmed` - Confirmed status
- `statusCompleted` - Completed status
- `statusFailed` - Failed status

### Payment Flow
- `paymentAmount` - Payment amount label
- `paymentMethod` - Payment method label
- `confirmPayment` - Confirm payment button
- `paymentSuccess` - Payment success message
- `paymentFailed` - Payment failed message

### Wallet
- `walletConnected` - Wallet connected status
- `walletDisconnected` - Wallet disconnected status
- `connectToWallet` - Connect to wallet action
- `disconnectWallet` - Disconnect wallet action

### Platform
- `platformLiff` - LINE Mini App platform name
- `platformWeb` - Web App platform name

### Common Actions
- `confirm` - Confirm button
- `cancel` - Cancel button
- `retry` - Retry button
- `back` - Back button
- `next` - Next button
- `loading` - Loading message
- `error` - Error message
- `success` - Success message

### Currency
- `currencyUsdc` - USDC currency name
- `currencyUsdt` - USDT currency name

## Language Detection

The system detects language in the following order:

1. **Browser Language**: Uses `navigator.language` or `navigator.userLanguage`
2. **IP Geolocation** (Optional): Can be enabled to detect based on user's IP location
3. **Fallback**: Defaults to English if detection fails

### Enabling IP-based Detection

To enable IP-based geolocation detection, uncomment the relevant section in `useLocalization.ts`:

```typescript
try {
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();
  if (data && data.country_code === 'JP') {
    langCode = 'ja';
  }
} catch (e) {
  // ignore errors and fallback to browser lang
}
```

## Adding New Languages

To add a new language (e.g., Korean):

1. Add the language code to the `SupportedLang` type:
```typescript
type SupportedLang = 'en' | 'ja' | 'ko';
```

2. Add translations to the `translations` object:
```typescript
const translations: Record<SupportedLang, Record<string, string>> = {
  en: { /* existing translations */ },
  ja: { /* existing translations */ },
  ko: {
    welcome: '환영합니다',
    connectWallet: '지갑 연결',
    // ... add all translations
  },
};
```

3. Update the detection logic:
```typescript
if (browserLang.startsWith('ko')) {
  langCode = 'ko';
} else if (browserLang.startsWith('ja')) {
  langCode = 'ja';
} else if (browserLang.startsWith('en')) {
  langCode = 'en';
}
```

## Adding New Translation Keys

To add new translation keys:

1. Add the key to both language objects in `translations`
2. Use the key in your components with `t('yourNewKey')`

## Best Practices

1. **Use descriptive keys**: Use clear, descriptive keys like `paymentAmount` instead of `amount`
2. **Provide fallbacks**: Always provide fallback text for missing translations
3. **Test both languages**: Ensure your UI works well with both English and Japanese text lengths
4. **Consider text expansion**: Japanese text can be longer than English, so design accordingly
5. **Use the date formatter**: Use `useDateFormat()` for consistent date formatting across languages

## Example Components

### WelcomeBanner Component

```tsx
import React from 'react';
import { useLocalization } from '../hooks';

export const WelcomeBanner: React.FC = () => {
  const { strings, lang } = useLocalization();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">{strings.welcome}</h1>
      <p className="text-blue-100">
        {lang === 'ja' 
          ? 'LINE ミニアプリへようこそ！安全で簡単なDeFi体験をお楽しみください。'
          : 'Welcome to LINE Mini App! Enjoy a secure and easy DeFi experience.'
        }
      </p>
    </div>
  );
};
```

### TransactionHistory Component

The `TransactionHistory` component has been updated to use localization for all text elements, including transaction types, statuses, and UI labels.

## Integration with LINE Mini Dapp Requirements

This localization system meets LINE Mini Dapp documentation requirements:

- ✅ **English and Japanese Support**: Default languages provided
- ✅ **Automatic Detection**: Detects user's browser language automatically
- ✅ **IP Geolocation Option**: Optional IP-based detection for accuracy
- ✅ **Easy Extension**: Simple to add more languages
- ✅ **Best Practices**: Follows LINE's Mini Dapp documentation guidelines

The system is designed to work seamlessly with LINE's Mini Dapp platform and provides a solid foundation for internationalization in your DeFi application.
