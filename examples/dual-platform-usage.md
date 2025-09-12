# Dual Platform Usage Examples

This document demonstrates how to use the LINE Yield dual-platform architecture in your applications.

## 🎯 Basic Usage

### 1. Platform Detection

```typescript
import { usePlatform } from '@line-yield/shared';

function MyComponent() {
  const { isLiff, isWeb, isMobile, platform } = usePlatform();

  return (
    <div>
      {isLiff && <p>Running in LINE LIFF</p>}
      {isWeb && <p>Running in Web Browser</p>}
      {isMobile && <p>Mobile device detected</p>}
      <p>Current platform: {platform}</p>
    </div>
  );
}
```

### 2. Universal Wallet Connection

```typescript
import { useUniversalWallet } from '@line-yield/shared';

function WalletButton() {
  const { wallet, connectWallet, disconnectWallet } = useUniversalWallet();

  const handleClick = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
        console.log('Wallet connected:', wallet.address);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  return (
    <button onClick={handleClick}>
      {wallet.isConnected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
```

### 3. DeFi Operations

```typescript
import { useLineYield } from '@line-yield/shared';

function YieldDashboard() {
  const { vaultData, deposit, withdraw, isDepositing, isWithdrawing, isLiff } = useLineYield();

  const handleDeposit = async () => {
    try {
      await deposit({ amount: '100' });
      console.log('Deposit successful');
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw({ amount: '50' });
      console.log('Withdraw successful');
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  return (
    <div>
      <h2>Yield Dashboard</h2>
      {vaultData && (
        <div>
          <p>Your Balance: {vaultData.userDeposited} USDC</p>
          <p>Yield Earned: {vaultData.userYield} USDC</p>
          <p>Current APY: {vaultData.currentAPY}%</p>
        </div>
      )}
      
      <button onClick={handleDeposit} disabled={isDepositing}>
        {isDepositing ? 'Processing...' : 'Deposit 100 USDC'}
      </button>
      
      <button onClick={handleWithdraw} disabled={isWithdrawing}>
        {isWithdrawing ? 'Processing...' : 'Withdraw 50 USDC'}
      </button>

      {isLiff && (
        <p className="text-blue-600">
          🚀 Gasless transactions enabled via LINE relayer
        </p>
      )}
    </div>
  );
}
```

## 🎨 Platform-Aware Components

### 1. Custom Button Component

```typescript
import { Button } from '@line-yield/shared';
import { usePlatform } from '@line-yield/shared';

function MyButton() {
  const { isLiff } = usePlatform();

  return (
    <Button 
      variant="primary"
      size={isLiff ? 'lg' : 'md'}  // Larger buttons for mobile
      fullWidth={isLiff}           // Full width on mobile
    >
      {isLiff ? '📱 LIFF Action' : '🌐 Web Action'}
    </Button>
  );
}
```

### 2. Conditional Layout

```typescript
import { Layout } from '@line-yield/shared';

function App() {
  return (
    <Layout showFooter={false}>  {/* Hide footer in LIFF */}
      <YourContent />
    </Layout>
  );
}
```

### 3. Responsive Design

```typescript
import { usePlatform } from '@line-yield/shared';

function ResponsiveGrid() {
  const { isLiff, isMobile } = usePlatform();

  const gridCols = isLiff || isMobile ? 1 : 3;

  return (
    <div className={`grid grid-cols-${gridCols} gap-4`}>
      <Card>Content 1</Card>
      <Card>Content 2</Card>
      <Card>Content 3</Card>
    </div>
  );
}
```

## 🔧 Advanced Usage

### 1. Custom Platform-Specific Logic

```typescript
import { usePlatform } from '@line-yield/shared';

function PlatformSpecificFeature() {
  const { isLiff } = usePlatform();

  const handleAction = () => {
    if (isLiff) {
      // LIFF-specific implementation
      console.log('Using LINE features');
      // Use LINE SDK features
    } else {
      // Web-specific implementation
      console.log('Using web features');
      // Use web APIs
    }
  };

  return (
    <button onClick={handleAction}>
      Platform-Specific Action
    </button>
  );
}
```

### 2. Wallet Type Detection

```typescript
import { useUniversalWallet } from '@line-yield/shared';

function WalletInfo() {
  const { wallet } = useUniversalWallet();

  const getWalletIcon = () => {
    switch (wallet.walletType) {
      case 'metamask':
        return '🦊';
      case 'line':
        return '📱';
      default:
        return '🔗';
    }
  };

  return (
    <div>
      <span>{getWalletIcon()}</span>
      <span>{wallet.walletType}</span>
      <span>{wallet.address}</span>
    </div>
  );
}
```

### 3. Transaction History

```typescript
import { TransactionHistory } from '@line-yield/shared';

function TransactionList() {
  const mockTransactions = [
    {
      id: '1',
      type: 'deposit',
      amount: '100',
      token: 'USDC',
      timestamp: new Date(),
      status: 'confirmed'
    },
    // ... more transactions
  ];

  return (
    <TransactionHistory 
      transactions={mockTransactions}
      className="mt-6"
    />
  );
}
```

## 🌐 Environment Configuration

### 1. LIFF App Configuration

```typescript
// packages/liff-app/src/providers/LiffProvider.tsx
import { LiffProvider } from './providers/LiffProvider';

function App() {
  return (
    <LiffProvider>
      <YourApp />
    </LiffProvider>
  );
}
```

### 2. Web App Configuration

```typescript
// packages/web-app/src/providers/WebProvider.tsx
import { WebProvider } from './providers/WebProvider';

function App() {
  return (
    <WebProvider>
      <YourApp />
    </WebProvider>
  );
}
```

## 📱 Mobile-Specific Features

### 1. Touch Optimization

```typescript
import { usePlatform } from '@line-yield/shared';

function TouchOptimizedButton() {
  const { isLiff } = usePlatform();

  return (
    <button 
      className={`px-6 py-4 ${isLiff ? 'touch-manipulation' : ''}`}
      style={{
        minHeight: isLiff ? '48px' : '36px',  // Larger touch targets
        fontSize: isLiff ? '16px' : '14px'    // Better readability
      }}
    >
      Touch-Friendly Button
    </button>
  );
}
```

### 2. Safe Area Handling

```typescript
import { usePlatform } from '@line-yield/shared';

function MobileLayout() {
  const { isLiff } = usePlatform();

  return (
    <div className={`min-h-screen ${isLiff ? 'pb-safe' : ''}`}>
      {/* Content with safe area padding for iOS */}
      <main className="p-4">
        Your content here
      </main>
    </div>
  );
}
```

## 🔐 Security Considerations

### 1. Account Linking

```typescript
import { AccountService } from '@line-yield/shared';

const accountService = new AccountService();

// Link accounts across platforms
await accountService.linkAccounts(
  walletAddress, 
  isLiff ? liffUserId : undefined
);

// Retrieve linked account
const linkedAccount = await accountService.getLinkedAccount(walletAddress);
```

### 2. Transaction Security

```typescript
import { useLineYield } from '@line-yield/shared';

function SecureTransaction() {
  const { deposit, isLiff } = useLineYield();

  const handleSecureDeposit = async (amount: string) => {
    try {
      // Validate amount
      if (parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      // Execute transaction
      const result = await deposit({ amount });
      
      // Log for audit
      console.log('Transaction completed:', {
        amount,
        platform: isLiff ? 'liff' : 'web',
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return (
    <button onClick={() => handleSecureDeposit('100')}>
      Secure Deposit
    </button>
  );
}
```

## 🧪 Testing

### 1. Platform Testing

```typescript
// tests/platform.test.ts
import { render } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('Platform Detection', () => {
  it('detects LIFF platform', () => {
    process.env.VITE_APP_MODE = 'liff';
    const { getByText } = render(<MyComponent />);
    expect(getByText('Running in LINE LIFF')).toBeInTheDocument();
  });

  it('detects Web platform', () => {
    process.env.VITE_APP_MODE = 'web';
    const { getByText } = render(<MyComponent />);
    expect(getByText('Running in Web Browser')).toBeInTheDocument();
  });
});
```

### 2. Wallet Testing

```typescript
// tests/wallet.test.ts
import { renderHook } from '@testing-library/react';
import { useUniversalWallet } from '@line-yield/shared';

describe('Universal Wallet', () => {
  it('connects to MetaMask on web', async () => {
    const { result } = renderHook(() => useUniversalWallet());
    
    await result.current.connectWallet({ type: 'metamask' });
    
    expect(result.current.wallet.isConnected).toBe(true);
    expect(result.current.wallet.walletType).toBe('metamask');
  });
});
```

This comprehensive dual-platform architecture enables seamless development and deployment of LINE Yield across both LIFF and Web environments while maintaining code efficiency and user experience consistency.
