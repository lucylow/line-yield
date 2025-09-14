// LIFF Configuration for LINE Yield NFT Collateral Mini Dapp

export interface LiffConfig {
  liffId: string;
  redirectUri: string;
  scope: string[];
  features: {
    shareTargetPicker: boolean;
    ble: boolean;
    qrCode: boolean;
    scanCode: boolean;
  };
  walletIntegration: {
    supportedWallets: string[];
    defaultWallet: string;
    fallbackWallets: string[];
  };
  nftIntegration: {
    supportedCollections: string[];
    defaultCollection: string;
    priceOracleEndpoint: string;
  };
}

export const liffConfig: LiffConfig = {
  liffId: process.env.VITE_LIFF_ID || 'your-liff-id-here',
  redirectUri: process.env.VITE_LIFF_REDIRECT_URI || 'https://your-domain.com/liff',
  scope: [
    'profile',
    'openid',
    'chat_message.write',
    'share_target_picker'
  ],
  features: {
    shareTargetPicker: true,
    ble: false,
    qrCode: true,
    scanCode: true,
  },
  walletIntegration: {
    supportedWallets: [
      'line-wallet',
      'okx-wallet',
      'bitget-wallet',
      'metamask',
      'walletconnect'
    ],
    defaultWallet: 'line-wallet',
    fallbackWallets: ['okx-wallet', 'bitget-wallet', 'metamask'],
  },
  nftIntegration: {
    supportedCollections: [
      '0x1234567890123456789012345678901234567890', // LINE NFT Collection
      '0x2345678901234567890123456789012345678901', // Kaia NFT Collection
    ],
    defaultCollection: '0x1234567890123456789012345678901234567890',
    priceOracleEndpoint: 'https://api.line-yield.com/nft/oracle',
  },
};

// Wallet detection utilities
export const detectWallet = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Check for LINE mini dapp wallet
  if ((window as any).liff && (window as any).liff.isLoggedIn()) {
    return 'line-wallet';
  }

  // Check for OKX Wallet
  if ((window as any).okxwallet) {
    return 'okx-wallet';
  }

  // Check for Bitget Wallet
  if ((window as any).bitget) {
    return 'bitget-wallet';
  }

  // Check for MetaMask
  if ((window as any).ethereum && (window as any).ethereum.isMetaMask) {
    return 'metamask';
  }

  // Check for WalletConnect
  if ((window as any).WalletConnect) {
    return 'walletconnect';
  }

  return null;
};

// Wallet connection utilities
export const connectWallet = async (walletType: string): Promise<any> => {
  switch (walletType) {
    case 'line-wallet':
      return await connectLineWallet();
    case 'okx-wallet':
      return await connectOKXWallet();
    case 'bitget-wallet':
      return await connectBitgetWallet();
    case 'metamask':
      return await connectMetaMask();
    case 'walletconnect':
      return await connectWalletConnect();
    default:
      throw new Error(`Unsupported wallet type: ${walletType}`);
  }
};

const connectLineWallet = async (): Promise<any> => {
  if (typeof window === 'undefined' || !(window as any).liff) {
    throw new Error('LIFF not available');
  }

  const liff = (window as any).liff;
  
  if (!liff.isLoggedIn()) {
    liff.login();
    return null;
  }

  // Get LINE profile
  const profile = await liff.getProfile();
  
  // Try to connect to LINE's built-in wallet or external wallet
  if ((window as any).ethereum) {
    const provider = (window as any).ethereum;
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    
    return {
      provider,
      address,
      profile,
      walletType: 'line-wallet',
    };
  }

  // Fallback to mock wallet for demo
  return {
    provider: null,
    address: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
    profile,
    walletType: 'line-wallet',
  };
};

const connectOKXWallet = async (): Promise<any> => {
  if (typeof window === 'undefined' || !(window as any).okxwallet) {
    throw new Error('OKX Wallet not available');
  }

  const provider = (window as any).okxwallet;
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];
  
  return {
    provider,
    address,
    walletType: 'okx-wallet',
  };
};

const connectBitgetWallet = async (): Promise<any> => {
  if (typeof window === 'undefined' || !(window as any).bitget) {
    throw new Error('Bitget Wallet not available');
  }

  const provider = (window as any).bitget;
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];
  
  return {
    provider,
    address,
    walletType: 'bitget-wallet',
  };
};

const connectMetaMask = async (): Promise<any> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not available');
  }

  const provider = (window as any).ethereum;
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];
  
  return {
    provider,
    address,
    walletType: 'metamask',
  };
};

const connectWalletConnect = async (): Promise<any> => {
  // WalletConnect implementation would go here
  throw new Error('WalletConnect not implemented yet');
};

// NFT utilities
export const getSupportedNFTs = async (userAddress: string): Promise<any[]> => {
  // This would typically query the blockchain or an indexing service
  // For demo purposes, return mock data
  return [
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      name: 'LINE NFT #1',
      image: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=LINE+NFT+1',
      metadata: {
        description: 'A unique LINE NFT for collateral',
        attributes: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Type', value: 'Digital Art' },
        ],
      },
    },
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '2',
      name: 'LINE NFT #2',
      image: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=LINE+NFT+2',
      metadata: {
        description: 'Another unique LINE NFT for collateral',
        attributes: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Type', value: 'Digital Art' },
        ],
      },
    },
  ];
};

export const getNFTValue = async (contractAddress: string, tokenId: string): Promise<string> => {
  // This would typically query the price oracle
  // For demo purposes, return mock values
  const mockValues: { [key: string]: string } = {
    '1': '1000.00',
    '2': '1500.00',
    '3': '2000.00',
  };
  
  return mockValues[tokenId] || '500.00';
};

// LINE-specific utilities
export const shareToLINE = async (message: string, url?: string): Promise<void> => {
  if (typeof window === 'undefined' || !(window as any).liff) {
    throw new Error('LIFF not available');
  }

  const liff = (window as any).liff;
  
  if (!liff.isLoggedIn()) {
    throw new Error('User not logged in');
  }

  const shareMessage = url ? `${message}\n${url}` : message;
  
  await liff.shareTargetPicker([
    {
      type: 'text',
      text: shareMessage,
    },
  ]);
};

export const openExternalLink = (url: string): void => {
  if (typeof window === 'undefined' || !(window as any).liff) {
    window.open(url, '_blank');
    return;
  }

  const liff = (window as any).liff;
  liff.openWindow({
    url,
    external: true,
  });
};

// Error handling utilities
export const handleLiffError = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      case 'INVALID_PARAMETER':
        return 'Invalid parameter provided';
      case 'UNAUTHORIZED':
        return 'Unauthorized access';
      case 'FORBIDDEN':
        return 'Access forbidden';
      case 'NOT_FOUND':
        return 'Resource not found';
      case 'INTERNAL_ERROR':
        return 'Internal server error';
      default:
        return `LIFF Error: ${error.message}`;
    }
  }
  
  return error.message || 'An unknown error occurred';
};

