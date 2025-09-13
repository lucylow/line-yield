import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
// Define networks manually since @reown/appkit/networks might not be available
const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
  blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
} as const;

const arbitrum = {
  id: 42161,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://arb1.arbitrum.io/rpc'] } },
  blockExplorers: { default: { name: 'Arbiscan', url: 'https://arbiscan.io' } },
} as const;

const polygon = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
  blockExplorers: { default: { name: 'PolygonScan', url: 'https://polygonscan.com' } },
} as const;

const base = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
  blockExplorers: { default: { name: 'BaseScan', url: 'https://basescan.org' } },
} as const;

// Define Kaia network since it might not be in the default networks
const kaia = {
  id: 8217,
  name: 'Kaia',
  nativeCurrency: {
    name: 'Kaia',
    symbol: 'KLAY',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kaia.klaytnweb3.com/v1/baobab'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KaiaScope',
      url: 'https://baobab.klaytnscope.com',
    },
  },
  testnet: true,
} as const;

// Setup query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Get project ID from environment variables
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

// App metadata
const metadata = {
  name: 'LINE Yield',
  description: 'DeFi Yield Optimization & Lending Platform',
  url: import.meta.env.VITE_APP_URL || 'https://line-yield.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Supported networks - focusing on Kaia and major EVM chains
const networks = [
  kaia, // Kaia network (main focus)
  mainnet, // Ethereum mainnet
  arbitrum, // Arbitrum
  polygon, // Polygon
  base, // Base
] as const;

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Enable analytics
    email: true, // Enable email authentication
    socials: ['google', 'twitter', 'discord', 'github'], // Social login options
    emailShowWallets: true, // Show wallet options in email flow
  },
  themeMode: 'light', // or 'dark' or 'auto'
  themeVariables: {
    '--w3m-accent': '#3b82f6', // Blue accent color
    '--w3m-accent-foreground': '#ffffff',
    '--w3m-border-radius-master': '8px',
  },
});

interface AppKitProviderProps {
  children: React.ReactNode;
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export the wagmi config for use in other components
export { wagmiAdapter };
