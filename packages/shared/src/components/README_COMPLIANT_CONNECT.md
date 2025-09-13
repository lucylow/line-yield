# Compliant Connect Button System for LINE Mini Dapp

This system provides wallet connection components that fully comply with Dapp Portal design guidelines, ensuring wallet connection is triggered only when specific actions are executed, not prematurely.

## Overview

The compliant connect button system includes:

- **CompliantConnectButton**: Basic connect button that defers connection until needed
- **ActionTriggeredConnect**: Action-specific button that connects wallet only when executing actions
- **useWalletConnection**: Hook for managing wallet connection state
- **useActionTriggeredConnect**: Hook for action-triggered connection management
- **Localized messages**: English and Japanese support
- **Multiple variants**: Different button styles and sizes

## Key Features

### ✅ Dapp Portal Design Guide Compliance
- **Deferred Connection**: Wallet connects only when specific actions are executed
- **Consistent Design**: Aligns with Dapp Portal UI standards
- **Action-Specific**: Different buttons for different actions (deposit, withdraw, buy, etc.)
- **User-Friendly**: Clear messaging about when connection is required
- **Z-Index Compliant**: Modals and popups use proper z-index values

### ✅ Comprehensive Functionality
- **Multiple Button Variants**: Default, primary, secondary, outline, success, warning, danger
- **Multiple Sizes**: Small, medium, large
- **Loading States**: Visual feedback during connection and action execution
- **Error Handling**: Proper error display and recovery
- **Localization**: Full English and Japanese support
- **Accessibility**: ARIA labels and keyboard navigation

## Usage Examples

### Basic Compliant Connect Button

```tsx
import { CompliantConnectButton, useWalletConnection } from '../components';

function MyComponent() {
  const { isConnected, userAddress, connect } = useWalletConnection();
  
  const handleConnect = async () => {
    await connect(async () => {
      // Your wallet connection logic here
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Handle connection
    });
  };
  
  return (
    <CompliantConnectButton
      onConnect={handleConnect}
      isConnected={isConnected}
      userAddress={userAddress}
      actionType="deposit"
    />
  );
}
```

### Action-Triggered Connect Button

```tsx
import { ActionTriggeredConnect, useActionTriggeredConnect } from '../components';

function DepositComponent() {
  const { 
    isConnected, 
    userAddress, 
    connect, 
    executeAction 
  } = useActionTriggeredConnect();
  
  const handleConnect = async () => {
    await connect(async () => {
      // Wallet connection logic
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    });
  };
  
  const handleDeposit = async () => {
    await executeAction(async () => {
      // Deposit logic
      console.log('Executing deposit...');
    });
  };
  
  return (
    <ActionTriggeredConnect
      action="deposit"
      isConnected={isConnected}
      userAddress={userAddress}
      onConnect={handleConnect}
      onAction={handleDeposit}
      variant="success"
      size="lg"
    />
  );
}
```

### Advanced Configuration

```tsx
function AdvancedComponent() {
  const { isConnected, userAddress, connect } = useWalletConnection({
    autoConnect: true,
    persistConnection: true,
    connectionTimeout: 30000,
    showErrors: true,
  });
  
  return (
    <CompliantConnectButton
      onConnect={connect}
      isConnected={isConnected}
      userAddress={userAddress}
      actionType="buy"
      variant="primary"
      size="lg"
      connectText="Connect to Purchase"
      actionDescription="Connect your wallet to complete the purchase"
    />
  );
}
```

### Multiple Action Buttons

```tsx
function MultiActionComponent() {
  const { isConnected, userAddress, connect } = useWalletConnection();
  
  return (
    <div className="space-y-4">
      <ActionTriggeredConnect
        action="deposit"
        isConnected={isConnected}
        userAddress={userAddress}
        onConnect={connect}
        onAction={() => console.log('Deposit')}
        variant="success"
      />
      
      <ActionTriggeredConnect
        action="withdraw"
        isConnected={isConnected}
        userAddress={userAddress}
        onConnect={connect}
        onAction={() => console.log('Withdraw')}
        variant="warning"
      />
      
      <ActionTriggeredConnect
        action="claim"
        isConnected={isConnected}
        userAddress={userAddress}
        onConnect={connect}
        onAction={() => console.log('Claim')}
        variant="primary"
      />
    </div>
  );
}
```

## Component Props

### CompliantConnectButton Props

```typescript
interface CompliantConnectButtonProps {
  onConnect: () => Promise<void>;           // Connection function
  isConnected: boolean;                     // Connection state
  userAddress?: string;                      // User's wallet address
  isConnecting?: boolean;                    // Connection in progress
  connectText?: string;                      // Custom connect text
  connectingText?: string;                   // Custom connecting text
  connectedText?: string;                   // Custom connected text
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;                        // Additional CSS classes
  disabled?: boolean;                        // Disabled state
  actionType?: 'deposit' | 'withdraw' | 'buy' | 'claim' | 'transfer' | 'custom';
  actionDescription?: string;                // Custom action description
}
```

### ActionTriggeredConnect Props

```typescript
interface ActionTriggeredConnectProps {
  action: 'deposit' | 'withdraw' | 'buy' | 'claim' | 'transfer' | 'custom';
  actionDescription?: string;                // Custom action description
  isConnected: boolean;                     // Connection state
  userAddress?: string;                      // User's wallet address
  onConnect: () => Promise<void>;           // Connection function
  onAction: () => Promise<void>;            // Action execution function
  isLoading?: boolean;                       // Loading state
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;                        // Additional CSS classes
  disabled?: boolean;                        // Disabled state
  actionText?: string;                       // Custom action text
  connectText?: string;                      // Custom connect text
}
```

## Hook Usage

### useWalletConnection Hook

```typescript
const {
  // State
  isConnected: boolean;
  userAddress: string | null;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
  balance: string | null;
  
  // Actions
  connect: (connectFunction: () => Promise<void>) => Promise<void>;
  disconnect: () => void;
  updateWalletInfo: (info: WalletInfo) => void;
  clearError: () => void;
  
  // Utilities
  isWalletAvailable: boolean;
  getWalletType: () => string | null;
} = useWalletConnection(config);
```

### useActionTriggeredConnect Hook

```typescript
const {
  // State
  isConnected: boolean;
  userAddress: string | null;
  isConnecting: boolean;
  isExecutingAction: boolean;
  error: string | null;
  
  // Actions
  connect: (connectFunction: () => Promise<void>) => Promise<void>;
  executeAction: (actionFunction: () => Promise<void>) => Promise<void>;
  disconnect: () => void;
  setUserAddress: (address: string | null) => void;
} = useActionTriggeredConnect();
```

## Button Variants

### Default Variant
```tsx
<CompliantConnectButton variant="default" />
```

### Primary Variant
```tsx
<CompliantConnectButton variant="primary" />
```

### Secondary Variant
```tsx
<CompliantConnectButton variant="secondary" />
```

### Outline Variant
```tsx
<CompliantConnectButton variant="outline" />
```

### Success Variant (ActionTriggeredConnect)
```tsx
<ActionTriggeredConnect variant="success" />
```

### Warning Variant (ActionTriggeredConnect)
```tsx
<ActionTriggeredConnect variant="warning" />
```

### Danger Variant (ActionTriggeredConnect)
```tsx
<ActionTriggeredConnect variant="danger" />
```

## Button Sizes

### Small
```tsx
<CompliantConnectButton size="sm" />
```

### Medium (Default)
```tsx
<CompliantConnectButton size="md" />
```

### Large
```tsx
<CompliantConnectButton size="lg" />
```

## Localization

The system supports English and Japanese with automatic language detection:

### English Messages
- Connect Wallet
- Connecting...
- Connected
- Connect to Deposit
- Connect to Withdraw
- Wallet connection required to deposit funds

### Japanese Messages
- ウォレットを接続
- 接続中...
- 接続済み
- 入金のために接続
- 出金のために接続
- 入金にはウォレット接続が必要です

## Integration Examples

### In Mini Dapp Pages

```tsx
// LineMiniDapp.tsx
import { ActionTriggeredConnect, useWalletConnection } from '../components';

const LineMiniDapp: React.FC = () => {
  const { isConnected, userAddress, connect } = useWalletConnection();
  
  return (
    <div>
      <ActionTriggeredConnect
        action="deposit"
        isConnected={isConnected}
        userAddress={userAddress}
        onConnect={connect}
        onAction={handleDeposit}
        variant="success"
      />
    </div>
  );
};
```

### With Error Handling

```tsx
function ErrorHandlingComponent() {
  const { isConnected, userAddress, connect, error, clearError } = useWalletConnection();
  
  return (
    <div>
      <CompliantConnectButton
        onConnect={connect}
        isConnected={isConnected}
        userAddress={userAddress}
        actionType="deposit"
      />
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={clearError} className="ml-2 text-red-500">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

### With Custom Styling

```tsx
function CustomStyledComponent() {
  return (
    <CompliantConnectButton
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      variant="primary"
      size="lg"
      actionType="buy"
    />
  );
}
```

## Best Practices

### 1. Action-Specific Buttons
- Use `ActionTriggeredConnect` for specific actions (deposit, withdraw, buy)
- Use `CompliantConnectButton` for general wallet connection
- Always specify the `actionType` for better user experience

### 2. Error Handling
- Always handle connection errors gracefully
- Provide clear error messages to users
- Allow users to retry failed connections

### 3. Loading States
- Show loading indicators during connection
- Disable buttons during connection to prevent multiple requests
- Provide visual feedback for all async operations

### 4. Accessibility
- Use proper ARIA labels
- Ensure keyboard navigation works
- Provide screen reader friendly text

### 5. Localization
- Always use the localization system
- Provide fallback text for custom messages
- Test with both English and Japanese

## Compliance Checklist

This implementation ensures full compliance with Dapp Portal Design Guide:

- ✅ **Deferred Connection**: Wallet connects only when specific actions are executed
- ✅ **Consistent Design**: Aligns with Dapp Portal UI standards
- ✅ **Action-Specific**: Different buttons for different actions
- ✅ **User-Friendly**: Clear messaging about connection requirements
- ✅ **Z-Index Compliant**: Proper modal and popup z-index values
- ✅ **Loading States**: Visual feedback during operations
- ✅ **Error Handling**: Proper error display and recovery
- ✅ **Localization**: English and Japanese support
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **Type Safety**: Full TypeScript support

## Troubleshooting

### Common Issues

1. **Connection not triggering**
   - Check if `onConnect` function is properly passed
   - Verify wallet is available in browser
   - Check for JavaScript errors in console

2. **Button not showing correct state**
   - Ensure `isConnected` prop is properly managed
   - Check `userAddress` prop is set when connected
   - Verify state updates are happening correctly

3. **Localization not working**
   - Check if `useLocalization` hook is properly set up
   - Verify language detection is working
   - Ensure translation keys exist in both languages

### Debug Mode

```tsx
// Enable debug logging
const { connect } = useWalletConnection({
  showErrors: true,
});

// Add console logging
const handleConnect = async () => {
  console.log('Connecting wallet...');
  try {
    await connect(async () => {
      // Connection logic
    });
    console.log('Wallet connected successfully');
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

The system provides a robust, compliant, and user-friendly wallet connection experience that fully adheres to Dapp Portal design guidelines while maintaining excellent developer experience and accessibility.
