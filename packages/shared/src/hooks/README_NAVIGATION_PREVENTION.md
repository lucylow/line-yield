# Navigation Prevention System for LINE Mini Dapp

This system provides comprehensive navigation prevention to protect user progress and prevent accidental exits from your LINE Mini Dapp, fully compliant with LINE Mini Dapp Design Guide requirements.

## Overview

The navigation prevention system includes:

- **Browser back button prevention** with confirmation dialogs
- **Page refresh/close prevention** to protect user progress
- **Localized confirmation messages** for English and Japanese
- **Flexible configuration** for different pages and scenarios
- **Reusable confirmation dialog component** with multiple variants
- **Utility functions** for custom navigation management

## Key Features

### ✅ LINE Design Guide Compliance
- Prevents accidental navigation from Mini Dapp
- Shows user-friendly confirmation dialogs
- Protects user progress and data
- Supports multiple languages (English/Japanese)
- Configurable for different pages and scenarios

### ✅ Comprehensive Protection
- Browser back button prevention
- Page refresh/close prevention
- Custom confirmation messages
- Multiple protected paths support
- Automatic cleanup and memory management

## Usage Examples

### Basic Hook Usage

```tsx
import { usePreventGoBack } from '../hooks';

function MyMiniDappComponent() {
  // Basic prevention with default settings
  usePreventGoBack();
  
  return <div>Your Mini Dapp content</div>;
}
```

### Advanced Configuration

```tsx
import { usePreventGoBack } from '../hooks';

function DashboardPage() {
  usePreventGoBack({
    enabled: true,
    protectedPaths: ['/dashboard', '/transactions'],
    message: 'Are you sure you want to leave? Your transaction will be lost.',
    preventUnload: true,
    title: 'Leave Dashboard?',
  });
  
  return <div>Dashboard content</div>;
}
```

### Simplified Hooks

```tsx
import { 
  usePreventGoBackSimple, 
  usePreventGoBackOnRoute, 
  usePreventGoBackWithMessage 
} from '../hooks';

// Simple prevention (default settings)
function SimpleComponent() {
  usePreventGoBackSimple();
  return <div>Content</div>;
}

// Prevent on specific route
function SpecificRouteComponent() {
  usePreventGoBackOnRoute('/checkout');
  return <div>Checkout content</div>;
}

// Custom message
function CustomMessageComponent() {
  usePreventGoBackWithMessage('Your form data will be lost. Continue?');
  return <div>Form content</div>;
}
```

### Confirmation Dialog Component

```tsx
import { ConfirmationDialog, useConfirmationDialog } from '../components';

function MyComponent() {
  const { showDialog, ConfirmationDialog } = useConfirmationDialog();
  
  const handleAction = () => {
    showDialog({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      variant: 'warning',
      onConfirm: () => {
        // Handle confirmation
        console.log('User confirmed');
      },
      onCancel: () => {
        // Handle cancellation
        console.log('User cancelled');
      },
    });
  };
  
  return (
    <div>
      <button onClick={handleAction}>Perform Action</button>
      <ConfirmationDialog />
    </div>
  );
}
```

## Configuration Options

### PreventGoBackConfig Interface

```typescript
interface PreventGoBackConfig {
  /** Whether to show confirmation dialog */
  enabled?: boolean;
  /** Custom confirmation message */
  message?: string;
  /** Paths to protect (default: ['/']) */
  protectedPaths?: string[];
  /** Whether to prevent browser refresh/close */
  preventUnload?: boolean;
  /** Custom confirmation title */
  title?: string;
}
```

### Default Configuration

```typescript
const defaultConfig: PreventGoBackConfig = {
  enabled: true,
  protectedPaths: ['/'],
  preventUnload: true,
  // Messages are localized automatically
};
```

## Integration Examples

### In Main App Layout

```tsx
// App.tsx
import { usePreventGoBack } from '../hooks';

const AppContent = () => {
  // Prevent navigation from Mini Dapp pages
  usePreventGoBack({
    enabled: true,
    protectedPaths: ['/line-mini-dapp', '/web-mini-dapp', '/mini-dapp-demo'],
    preventUnload: true,
  });
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Your routes */}
      </Routes>
    </BrowserRouter>
  );
};
```

### In Individual Pages

```tsx
// LineMiniDapp.tsx
import { usePreventGoBack } from '../hooks';

const LineMiniDapp: React.FC = () => {
  usePreventGoBack({
    message: 'Are you sure you want to leave LINE Yield? Your progress will be saved.',
  });
  
  return <div>LINE Mini Dapp content</div>;
};
```

### With Localization

```tsx
import { usePreventGoBack } from '../hooks';
import { useLocalization } from '../hooks';

function LocalizedComponent() {
  const { lang } = useLocalization();
  
  const config = lang === 'ja' ? {
    message: '本当に戻りますか？進行中の作業が失われる可能性があります。',
    title: '確認',
  } : {
    message: 'Are you sure you want to go back? Your progress may be lost.',
    title: 'Confirm Navigation',
  };
  
  usePreventGoBack(config);
  
  return <div>Localized content</div>;
}
```

## Confirmation Dialog Variants

### Default Variant
```tsx
<ConfirmationDialog
  isOpen={true}
  onConfirm={() => {}}
  onCancel={() => {}}
  variant="default"
/>
```

### Warning Variant
```tsx
<ConfirmationDialog
  isOpen={true}
  onConfirm={() => {}}
  onCancel={() => {}}
  variant="warning"
  title="Warning"
  message="This action cannot be undone."
/>
```

### Danger Variant
```tsx
<ConfirmationDialog
  isOpen={true}
  onConfirm={() => {}}
  onCancel={() => {}}
  variant="danger"
  title="Danger"
  message="This will permanently delete your data."
/>
```

## Utility Functions

### Navigation Utilities

```tsx
import { 
  setupNavigationPrevention,
  navigationPreventionPresets,
  getLocalizedConfirmationMessage 
} from '../utils';

// Setup prevention manually
const cleanup = setupNavigationPrevention({
  enabled: true,
  protectedPaths: ['/checkout'],
  message: 'Are you sure you want to leave?',
  preventUnload: true,
});

// Use presets
const config = navigationPreventionPresets.rootOnly('Custom message');
const cleanup2 = setupNavigationPrevention(config);

// Get localized messages
const message = getLocalizedConfirmationMessage('ja'); // Japanese
const messageEn = getLocalizedConfirmationMessage('en'); // English
```

### Validation

```tsx
import { validateNavigationConfig } from '../utils';

const errors = validateNavigationConfig({
  protectedPaths: [], // This will cause an error
  message: 'A'.repeat(300), // This will cause an error
});

// Returns validation errors:
// - "At least one protected path must be specified"
// - "Confirmation message should be 200 characters or less"
```

## Best Practices

### 1. Strategic Implementation
- **Protect critical pages**: Forms, checkout, transaction flows
- **Avoid over-protection**: Don't protect every page
- **User-friendly messages**: Clear, concise confirmation text

### 2. Performance Considerations
- **Cleanup properly**: Hooks handle cleanup automatically
- **Conditional enabling**: Disable when not needed
- **Memory management**: Avoid memory leaks with proper cleanup

### 3. User Experience
- **Clear messaging**: Explain what will be lost
- **Consistent behavior**: Same behavior across similar pages
- **Accessibility**: Ensure dialogs are accessible

### 4. Localization
- **Provide translations**: Support multiple languages
- **Cultural considerations**: Adapt messages for different cultures
- **Consistent terminology**: Use same terms across the app

## Common Use Cases

### 1. Form Protection
```tsx
function FormPage() {
  usePreventGoBack({
    message: 'Are you sure you want to leave? Your form data will be lost.',
    preventUnload: true,
  });
  
  return <form>Form content</form>;
}
```

### 2. Transaction Flow
```tsx
function TransactionPage() {
  usePreventGoBack({
    message: 'Are you sure you want to leave? Your transaction will be cancelled.',
    protectedPaths: ['/transaction', '/payment'],
  });
  
  return <div>Transaction flow</div>;
}
```

### 3. Multi-step Process
```tsx
function MultiStepProcess() {
  usePreventGoBack({
    message: 'Are you sure you want to leave? You will lose your progress.',
    protectedPaths: ['/step1', '/step2', '/step3'],
  });
  
  return <div>Multi-step content</div>;
}
```

### 4. Conditional Protection
```tsx
function ConditionalPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  usePreventGoBack({
    enabled: hasUnsavedChanges,
    message: 'You have unsaved changes. Are you sure you want to leave?',
  });
  
  return <div>Conditional content</div>;
}
```

## Compliance Checklist

This implementation ensures full compliance with LINE Mini Dapp Design Guide:

- ✅ **Prevents Accidental Navigation**: Browser back button protection
- ✅ **User Progress Protection**: Prevents data loss
- ✅ **Confirmation Dialogs**: User-friendly confirmation messages
- ✅ **Localization Support**: English and Japanese support
- ✅ **Flexible Configuration**: Customizable for different scenarios
- ✅ **Performance Optimized**: Proper cleanup and memory management
- ✅ **Accessibility**: Accessible confirmation dialogs
- ✅ **Type Safety**: Full TypeScript support

## Troubleshooting

### Common Issues

1. **Navigation not prevented**
   - Check if `enabled` is set to `true`
   - Verify `protectedPaths` includes current path
   - Ensure hook is mounted in a persistent component

2. **Confirmation not showing**
   - Check browser console for errors
   - Verify `window.confirm` is available
   - Ensure proper event listener setup

3. **Memory leaks**
   - Hooks handle cleanup automatically
   - Avoid manual event listener management
   - Use cleanup functions when using utilities directly

### Debug Mode

```tsx
// Enable debug logging
usePreventGoBack({
  enabled: true,
  protectedPaths: ['/debug'],
  message: 'Debug: Navigation prevented',
});
```

The system provides robust protection against accidental navigation while maintaining excellent user experience and full compliance with LINE Mini Dapp requirements.
