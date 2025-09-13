import React, { createContext, useContext, useState } from 'react';

interface WalletInfo {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  chainId: number | undefined;
  balance: string | undefined;
  balanceFormatted: string | undefined;
  symbol: string | undefined;
  isKaiaNetwork: boolean;
}

interface WalletContextType extends WalletInfo {
  connect: () => void;
  disconnect: () => void;
  switchToKaia: () => void;
  openAppKit: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface SimpleWalletProviderProps {
  children: React.ReactNode;
}

export function SimpleWalletProvider({ children }: SimpleWalletProviderProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    chainId: undefined,
    balance: undefined,
    balanceFormatted: undefined,
    symbol: undefined,
    isKaiaNetwork: false,
  });

  const connect = () => {
    setWalletInfo(prev => ({ ...prev, isConnecting: true }));
    
    // Simulate wallet connection
    setTimeout(() => {
      setWalletInfo({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
        chainId: 8217, // Kaia network
        balance: '1000000000000000000', // 1 ETH in wei
        balanceFormatted: '1.0',
        symbol: 'KLAY',
        isKaiaNetwork: true,
      });
    }, 1000);
  };

  const disconnect = () => {
    setWalletInfo({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      chainId: undefined,
      balance: undefined,
      balanceFormatted: undefined,
      symbol: undefined,
      isKaiaNetwork: false,
    });
  };

  const switchToKaia = () => {
    if (walletInfo.isConnected) {
      setWalletInfo(prev => ({ ...prev, chainId: 8217, isKaiaNetwork: true }));
    }
  };

  const openAppKit = () => {
    connect();
  };

  const contextValue: WalletContextType = {
    ...walletInfo,
    connect,
    disconnect,
    switchToKaia,
    openAppKit,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a SimpleWalletProvider');
  }
  return context;
}

export function useNetworkCheck() {
  const { chainId, isConnected, switchToKaia } = useWallet();
  
  const isCorrectNetwork = chainId === 8217;
  
  return {
    isCorrectNetwork,
    isConnected,
    switchToCorrectNetwork: switchToKaia,
    currentChainId: chainId,
    targetChainId: 8217,
  };
}
