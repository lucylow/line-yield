# Meta Tags Management for LINE Mini Dapp

This system provides comprehensive Open Graph and Twitter meta tag management according to LINE Mini Dapp Design Guide requirements.

## Overview

The meta tags system ensures proper social sharing, SEO optimization, and compliance with LINE Mini Dapp design guidelines. It includes:

- **Open Graph tags** for Facebook, LinkedIn, and other social platforms
- **Twitter Card tags** for Twitter sharing
- **Standard meta tags** for SEO
- **Dynamic updates** based on page content
- **Localization support** for multiple languages

## Key Features

### ✅ LINE Design Guide Compliance
- Proper title format: `"{Mini Dapp Name} | Mini Dapp"`
- Comprehensive Open Graph implementation
- Twitter Card optimization
- Proper image dimensions (1200x630px)
- SEO-friendly meta descriptions

### ✅ Dynamic Meta Tag Management
- Automatic updates based on page content
- Support for different languages
- Page-specific meta configurations
- Validation and error checking

## Usage Examples

### Basic Hook Usage

```tsx
import { useMiniDappTitle } from '../hooks';

function MyMiniDappComponent() {
  // Sets title and updates all meta tags
  useMiniDappTitle('LINE Yield');
  
  return <div>Your Mini Dapp content</div>;
}
```

### Advanced Meta Configuration

```tsx
import { useMiniDappTitle } from '../hooks';

function DashboardPage() {
  useMiniDappTitle('LINE Yield', {
    description: 'Manage your USDT investments and track earnings in LINE Yield Dashboard.',
    url: 'https://line-yield-mini-dapp.com/dashboard',
    image: 'https://line-yield-mini-dapp.com/assets/dashboard-og.svg',
  });
  
  return <div>Dashboard content</div>;
}
```

### Direct Meta Tag Updates

```tsx
import { updateAllMetaTags, setPageMetaTags } from '../utils';

// Update all meta tags
updateAllMetaTags({
  title: 'LINE Yield - Transactions',
  description: 'View your transaction history and earnings.',
  url: 'https://line-yield-mini-dapp.com/transactions',
});

// Use pre-configured page setters
setPageMetaTags('Dashboard');
```

### Localized Meta Tags

```tsx
import { setLocalizedMetaTags } from '../utils';

// Set Japanese meta tags
setLocalizedMetaTags('ja', {
  title: 'LINE イールド',
  description: 'LINE Messenger内でのシームレスなDeFi体験。',
});
```

## Meta Tag Structure

### Open Graph Tags
```html
<meta property="og:title" content="LINE Yield" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://line-yield-mini-dapp.com" />
<meta property="og:image" content="https://line-yield-mini-dapp.com/assets/og-image.svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="LINE Yield Mini Dapp - DeFi on LINE Messenger" />
<meta property="og:description" content="Seamless DeFi experience inside LINE Messenger..." />
<meta property="og:site_name" content="Mini Dapp" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="ja_JP" />
```

### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@line_yield" />
<meta name="twitter:creator" content="@line_yield" />
<meta name="twitter:title" content="LINE Yield" />
<meta name="twitter:description" content="Seamless DeFi experience..." />
<meta name="twitter:image" content="https://line-yield-mini-dapp.com/assets/og-image.svg" />
<meta name="twitter:image:alt" content="LINE Yield Mini Dapp - DeFi on LINE Messenger" />
```

### Standard Meta Tags
```html
<meta name="description" content="Seamless DeFi experience inside LINE Messenger..." />
<meta name="keywords" content="Mini Dapp, LINE, Kaia Blockchain, DeFi, Web3, USDT, Yield Farming" />
<meta name="author" content="LINE Yield Team" />
<meta name="robots" content="index, follow" />
```

## Configuration Options

### MetaTagConfig Interface
```typescript
interface MetaTagConfig {
  title: string;
  description: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  siteName?: string;
  locale?: string;
  twitterSite?: string;
  twitterCreator?: string;
  keywords?: string;
  author?: string;
}
```

### Default Configuration
```typescript
export const DEFAULT_META_CONFIG: MetaTagConfig = {
  title: 'LINE Yield',
  description: 'Seamless DeFi experience inside LINE Messenger powered by Kaia Blockchain. Earn automated yield on your USDT with 8.64% APY.',
  url: 'https://line-yield-mini-dapp.com',
  image: 'https://line-yield-mini-dapp.com/assets/og-image.svg',
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'LINE Yield Mini Dapp - DeFi on LINE Messenger',
  siteName: 'Mini Dapp',
  locale: 'en_US',
  twitterSite: '@line_yield',
  twitterCreator: '@line_yield',
  keywords: 'Mini Dapp, LINE, Kaia Blockchain, DeFi, Web3, USDT, Yield Farming, Stablecoin',
  author: 'LINE Yield Team',
};
```

## Pre-configured Setters

```typescript
import { metaTagSetters } from '../utils';

// Use pre-configured setters for common pages
metaTagSetters.dashboard();     // Dashboard page meta tags
metaTagSetters.transactions();   // Transactions page meta tags
metaTagSetters.settings();       // Settings page meta tags
metaTagSetters.wallet();         // Wallet connect page meta tags
metaTagSetters.default();        // Default meta tags
```

## Validation

The system includes validation to ensure meta tags meet best practices:

```typescript
import { validateMetaConfig } from '../utils';

const errors = validateMetaConfig({
  title: 'This title is way too long and will be truncated in search results',
  description: 'This description is also too long and will be cut off in social media previews',
});

// Returns validation errors:
// - "Title should be 60 characters or less for optimal display"
// - "Description should be 160 characters or less for optimal display"
```

## Integration Examples

### In Mini Dapp Pages

```tsx
// LineMiniDapp.tsx
import { useMiniDappTitle } from '../../packages/shared/src/hooks';

const LineMiniDapp: React.FC = () => {
  useMiniDappTitle('LINE Yield', {
    description: 'Access LINE Yield Mini Dapp directly in LINE Messenger. Earn automated yield on your USDT.',
    url: 'https://line-yield-mini-dapp.com/line-mini-dapp',
  });
  
  return <div>LINE Mini Dapp content</div>;
};
```

### With Localization

```tsx
import { useMiniDappTitle } from '../hooks';
import { useLocalization } from '../hooks';

function LocalizedMiniDapp() {
  const { lang } = useLocalization();
  
  const config = lang === 'ja' ? {
    title: 'LINE イールド',
    description: 'LINE Messenger内でのシームレスなDeFi体験。Kaia Blockchainを活用したUSDTの自動利回り獲得。',
    locale: 'ja_JP',
  } : {
    title: 'LINE Yield',
    description: 'Seamless DeFi experience inside LINE Messenger powered by Kaia Blockchain.',
    locale: 'en_US',
  };
  
  useMiniDappTitle(config.title, config);
  
  return <div>Localized content</div>;
}
```

### Dynamic Page Updates

```tsx
import { useEffect } from 'react';
import { setPageMetaTags } from '../utils';

function TransactionHistory() {
  const [transactions] = useState([]);
  
  useEffect(() => {
    // Update meta tags based on transaction count
    const pageName = transactions.length > 0 
      ? `Transactions (${transactions.length})` 
      : 'Transactions';
    
    setPageMetaTags(pageName, {
      description: transactions.length > 0 
        ? `View your ${transactions.length} transactions in LINE Yield.`
        : 'Your transaction history will appear here.',
    });
  }, [transactions]);
  
  return <div>Transaction history</div>;
}
```

## Best Practices

### 1. Title Optimization
- Keep titles under 60 characters
- Use descriptive, keyword-rich titles
- Include the Mini Dapp name consistently

### 2. Description Optimization
- Keep descriptions under 160 characters
- Include key features and benefits
- Use action-oriented language

### 3. Image Requirements
- Use 1200x630px images for optimal display
- Include alt text for accessibility
- Use absolute URLs for images

### 4. URL Management
- Use absolute URLs for og:url
- Ensure URLs are accessible and canonical
- Update URLs when content changes

### 5. Localization
- Provide alternate locale tags
- Translate descriptions appropriately
- Consider cultural differences in messaging

## Open Graph Image

The system includes a custom Open Graph image (`og-image.svg`) that:

- ✅ Meets LINE design guidelines
- ✅ Uses proper dimensions (1200x630px)
- ✅ Includes LINE branding elements
- ✅ Shows key features and benefits
- ✅ Uses appropriate colors and typography
- ✅ Is optimized for social sharing

## Compliance Checklist

This implementation ensures full compliance with LINE Mini Dapp Design Guide:

- ✅ **Proper Title Format**: `"{Mini Dapp Name} | Mini Dapp"`
- ✅ **Complete Open Graph Tags**: All required og: properties
- ✅ **Twitter Card Support**: Full Twitter Card implementation
- ✅ **SEO Optimization**: Proper meta descriptions and keywords
- ✅ **Image Requirements**: 1200x630px Open Graph image
- ✅ **Localization Support**: Multi-language meta tags
- ✅ **Dynamic Updates**: Page-specific meta configurations
- ✅ **Validation**: Built-in validation for best practices

The system provides a robust foundation for social sharing, SEO, and compliance with LINE Mini Dapp requirements while maintaining flexibility for customization and localization.
