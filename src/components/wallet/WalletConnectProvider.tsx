import React, { createContext, useContext, useEffect, useState } from 'react';

// Simplified WalletConnect implementation without external dependencies
interface WalletConnectContextType {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletConnectContext = createContext<WalletConnectContextType | null>(null);

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within WalletConnectProvider');
  }
  return context;
};

interface WalletConnectProviderProps {
  children: React.ReactNode;
}

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();

  const connect = async () => {
    try {
      // Mock WalletConnect connection
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setIsConnected(true);
      setAddress(mockAddress);
      setChainId(8217); // Kaia mainnet
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      setIsConnected(false);
      setAddress(undefined);
      setChainId(undefined);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const value: WalletConnectContextType = {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
  };

  return (
    <WalletConnectContext.Provider value={value}>
      {children}
    </WalletConnectContext.Provider>
  );
};

// Bitget wallet specific integration
export const BitgetWalletConnect: React.FC = () => {
  const { isConnected, address, chainId, connect, disconnect } = useWalletConnect();

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Bitget Wallet (WalletConnect)</p>
            <p className="text-sm font-medium text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs text-gray-500">Chain ID: {chainId}</p>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          <span>🟡</span>
          Connect Bitget Wallet
        </button>
      )}
    </div>
  );
};