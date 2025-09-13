# Reown AppKit Integration Guide

## Overview

This guide covers the integration of Reown AppKit (formerly WalletConnect) into your LINE Yield DeFi application. AppKit provides seamless wallet connectivity across multiple blockchain ecosystems with support for Ethereum, Solana, Bitcoin, and other networks.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query
```

### 2. Get Project ID

1. Visit [Reown Dashboard](https://dashboard.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your environment variables:

```bash
# .env
VITE_REOWN_PROJECT_ID=your_project_id_here
```

### 3. Setup AppKit Provider

The `AppKitProvider` component wraps your entire application and provides wallet connectivity:

```typescript
// src/providers/AppKitProvider.tsx
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { kaia, mainnet, arbitrum } from '@reown/appkit/networks';

const queryClient = new QueryClient();
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

const wagmiAdapter = new WagmiAdapter({
  networks: [kaia, mainnet, arbitrum],
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [kaia, mainnet, arbitrum],
  projectId,
  metadata: {
    name: 'LINE Yield',
    description: 'DeFi Yield Optimization & Lending Platform',
    url: 'https://line-yield.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'twitter', 'discord', 'github'],
  },
});

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4. Use Wallet Hooks

```typescript
// src/hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  
  const { data: balanceData } = useBalance({
    address: address,
  });

  return {
    address,
    isConnected,
    chainId,
    balance: balanceData?.formatted,
    symbol: balanceData?.symbol,
    connect: () => open(),
    disconnect,
  };
}
```

### 5. Create Connect Button

```typescript
// src/components/WalletConnectButton.tsx
import { useWallet } from '../hooks/useWallet';

export const WalletConnectButton = () => {
  const { address, isConnected, connect, balance, symbol } = useWallet();

  if (!isConnected) {
    return (
      <button onClick={connect} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-white border rounded-lg px-4 py-2">
      <div className="text-sm">
        <div className="font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
        <div className="text-gray-500">{balance} {symbol}</div>
      </div>
      <button onClick={disconnect} className="text-red-600 hover:text-red-700">
        Disconnect
      </button>
    </div>
  );
};
```

## 🔧 Advanced Configuration

### Custom Networks

```typescript
import { defineNetwork } from '@reown/appkit/networks';

const customNetwork = defineNetwork({
  id: 12345,
  name: 'Custom Network',
  nativeCurrency: {
    name: 'Custom Token',
    symbol: 'CUSTOM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.custom-network.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Custom Explorer',
      url: 'https://explorer.custom-network.com',
    },
  },
});

const networks = [kaia, mainnet, customNetwork];
```

### Theming

```typescript
createAppKit({
  // ... other config
  themeMode: 'light', // 'light', 'dark', or 'auto'
  themeVariables: {
    '--w3m-accent': '#3b82f6',
    '--w3m-accent-foreground': '#ffffff',
    '--w3m-border-radius-master': '8px',
    '--w3m-font-family': 'Inter, sans-serif',
  },
});
```

### Social Authentication

```typescript
createAppKit({
  // ... other config
  features: {
    email: true,
    socials: ['google', 'twitter', 'discord', 'github'],
    emailShowWallets: true,
  },
});
```

## 📱 Smart Contract Interaction

### Reading Contract Data

```typescript
import { useReadContract } from 'wagmi';

const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
] as const;

function TokenBalance({ tokenAddress, userAddress }) {
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return <div>Balance: {balance?.toString()}</div>;
}
```

### Writing to Contracts

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function TransferTokens({ tokenAddress, recipient, amount }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = () => {
    writeContract({
      address: tokenAddress,
      abi: USDT_ABI,
      functionName: 'transfer',
      args: [recipient, BigInt(amount)],
    });
  };

  return (
    <button 
      onClick={handleTransfer}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Transfer'}
    </button>
  );
}
```

## 🎨 UI Components

### Web Components

AppKit provides global web components that don't require imports:

```html
<!-- Connect Button -->
<appkit-button />

<!-- Network Switch -->
<appkit-network-button />

<!-- Account Button -->
<appkit-account-button />
```

### Custom Components

```typescript
import { useAppKit } from '@reown/appkit/react';

function CustomConnectButton() {
  const { open } = useAppKit();
  
  return (
    <button onClick={open} className="custom-button">
      Connect Wallet
    </button>
  );
}
```

## 🔐 Security Best Practices

### 1. Environment Variables

Never commit your Project ID to version control:

```bash
# .env (add to .gitignore)
VITE_REOWN_PROJECT_ID=your_actual_project_id

# .env.example (safe to commit)
VITE_REOWN_PROJECT_ID=your_project_id_here
```

### 2. Network Validation

Always validate the user is on the correct network:

```typescript
import { useNetworkCheck } from '../hooks/useWallet';

function ProtectedComponent() {
  const { isCorrectNetwork, switchToCorrectNetwork } = useNetworkCheck();

  if (!isCorrectNetwork) {
    return (
      <div className="alert">
        <p>Please switch to Kaia network</p>
        <button onClick={switchToCorrectNetwork}>Switch Network</button>
      </div>
    );
  }

  return <YourComponent />;
}
```

### 3. Error Handling

```typescript
import { useAccount } from 'wagmi';

function WalletStatus() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

  if (isConnecting) return <div>Connecting...</div>;
  if (isDisconnected) return <div>Please connect your wallet</div>;
  if (!address) return <div>No wallet address found</div>;

  return <div>Connected: {address}</div>;
}
```

## 🚀 Deployment

### 1. Update Project ID

For production, update your Project ID in the Reown Dashboard:

1. Go to [Reown Dashboard](https://dashboard.reown.com)
2. Select your project
3. Add your production domain to allowed origins
4. Update environment variables

### 2. Build Configuration

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Environment Variables

```bash
# Production .env
VITE_REOWN_PROJECT_ID=your_production_project_id
VITE_APP_URL=https://your-domain.com
VITE_API_BASE_URL=https://api.your-domain.com
```

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid Project ID"**
   - Verify your Project ID is correct
   - Check that your domain is added to allowed origins

2. **"Network not supported"**
   - Ensure the network is included in your networks array
   - Check that the network configuration is correct

3. **"Transaction failed"**
   - Verify the user has sufficient balance
   - Check that the contract address and ABI are correct
   - Ensure the user is on the correct network

### Debug Mode

Enable debug mode for development:

```typescript
createAppKit({
  // ... other config
  enableAnalytics: false, // Disable in development
  enableNetworkView: true, // Show network selection
});
```

## 📚 Additional Resources

- [Reown AppKit Documentation](https://docs.reown.com/appkit)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [React Query Documentation](https://tanstack.com/query)

## 🎯 Integration with LINE Yield

The AppKit integration provides:

1. **Seamless Wallet Connection**: Support for 300+ wallets
2. **Multi-Chain Support**: Kaia, Ethereum, Polygon, Arbitrum, Base
3. **Social Authentication**: Email and social login options
4. **Smart Contract Interaction**: Easy integration with your loan contracts
5. **Mobile Support**: Responsive design for mobile wallets
6. **Analytics**: Built-in user analytics and insights

This integration enables users to easily connect their wallets and interact with your LINE Yield lending platform across multiple blockchain networks.
