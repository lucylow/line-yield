# Document Title Management for LINE Mini Dapp

This system provides proper browser tab title management according to LINE Mini Dapp design guide requirements.

## Format Requirements

According to LINE Mini Dapp design guide, the browser tab title must follow this format:
```
"{Mini Dapp Name} | Mini Dapp"
```

Examples:
- `LINE Yield | Mini Dapp`
- `LINE Yield Dashboard | Mini Dapp`
- `LINE Yield Transactions | Mini Dapp`

## Usage

### React Hook Usage

```tsx
import { useMiniDappTitle } from '../hooks';

function MyMiniDappComponent() {
  // Automatically sets title to "LINE Yield | Mini Dapp"
  useMiniDappTitle('LINE Yield');
  
  return <div>Your Mini Dapp content</div>;
}
```

### Custom Title Hook

```tsx
import { useDocumentTitle } from '../hooks';

function MyComponent() {
  // Sets custom title with automatic formatting
  useDocumentTitle('LINE Yield Dashboard');
  // Results in: "LINE Yield Dashboard | Mini Dapp"
  
  return <div>Dashboard content</div>;
}
```

### Direct Utility Functions

```tsx
import { setMiniDappTitle, formatMiniDappTitle } from '../utils';

// Set title directly
setMiniDappTitle('LINE Yield');

// Format title without setting
const formattedTitle = formatMiniDappTitle('LINE Yield');
// Returns: "LINE Yield | Mini Dapp"
```

### Dynamic Titles

```tsx
import { setDynamicMiniDappTitle } from '../utils';

// Set title with page context
setDynamicMiniDappTitle('LINE Yield', 'Dashboard');
// Results in: "LINE Yield - Dashboard | Mini Dapp"
```

### Pre-configured Title Setters

```tsx
import { titleSetters } from '../utils';

// Use pre-configured setters
titleSetters.dashboard(); // "LINE Yield Dashboard | Mini Dapp"
titleSetters.transactions(); // "LINE Yield Transactions | Mini Dapp"
titleSetters.settings(); // "LINE Yield Settings | Mini Dapp"
titleSetters.default(); // "LINE Yield | Mini Dapp"
```

## Implementation Details

### HTML Meta Tags

The system automatically updates these meta tags for better SEO and social sharing:

```html
<title>LINE Yield | Mini Dapp</title>
<meta property="og:title" content="LINE Yield | Mini Dapp" />
<meta name="twitter:title" content="LINE Yield | Mini Dapp" />
```

### Automatic Cleanup

The `useDocumentTitle` hook includes cleanup functionality to restore titles when components unmount.

### Type Safety

All functions are fully typed with TypeScript for better development experience:

```typescript
type SupportedLang = 'en' | 'ja';

interface Localization {
  lang: SupportedLang;
  strings: Record<string, string>;
}
```

## Integration Examples

### In Mini Dapp Pages

```tsx
// LineMiniDapp.tsx
import { useMiniDappTitle } from '../../packages/shared/src/hooks';

const LineMiniDapp: React.FC = () => {
  useMiniDappTitle('LINE Yield');
  
  return (
    <div>
      {/* Your Mini Dapp content */}
    </div>
  );
};
```

### In Web Mini Dapp

```tsx
// WebMiniDapp.tsx
import { useMiniDappTitle } from '../../packages/shared/src/hooks';

const WebMiniDapp: React.FC = () => {
  useMiniDappTitle('LINE Yield');
  
  return (
    <div>
      {/* Your Web Mini Dapp content */}
    </div>
  );
};
```

### With Localization

```tsx
import { useMiniDappTitle } from '../hooks';
import { useLocalization } from '../hooks';

function LocalizedMiniDapp() {
  const { lang } = useLocalization();
  
  // Set title based on language
  const appName = lang === 'ja' ? 'LINE イールド' : 'LINE Yield';
  useMiniDappTitle(appName);
  
  return <div>Localized content</div>;
}
```

## Best Practices

1. **Consistent Naming**: Always use the same Mini Dapp name across all pages
2. **Page Context**: Use dynamic titles for different pages/sections
3. **SEO Optimization**: The system automatically updates meta tags
4. **Cleanup**: Hooks handle cleanup automatically
5. **Type Safety**: Use TypeScript for better development experience

## Common Mini Dapp Names

The system includes pre-defined constants for common Mini Dapp names:

```typescript
export const MINI_DAPP_NAMES = {
  LINE_YIELD: 'LINE Yield',
  LINE_YIELD_DASHBOARD: 'LINE Yield Dashboard',
  LINE_YIELD_TRANSACTIONS: 'LINE Yield Transactions',
  LINE_YIELD_SETTINGS: 'LINE Yield Settings',
} as const;
```

## Compliance

This implementation fully complies with LINE Mini Dapp design guide requirements:

- ✅ **Proper Format**: `"{Mini Dapp Name} | Mini Dapp"`
- ✅ **HTML Title Tag**: Updated in `index.html`
- ✅ **Meta Tags**: Open Graph and Twitter cards updated
- ✅ **Dynamic Updates**: Title changes based on page/state
- ✅ **SEO Optimization**: Proper meta tag management
- ✅ **Type Safety**: Full TypeScript support

The system ensures your Mini Dapp meets all LINE design guide requirements for browser tab titles while providing a flexible and easy-to-use API for developers.
